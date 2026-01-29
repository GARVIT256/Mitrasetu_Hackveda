import { useCallback, useEffect, useRef, useState } from 'react';
import { basicProfanityFilter, detectRiskPhrases } from '../utils/safety';
import { GeminiWebRtcClient } from '../lib/geminiWebRtcClient.jsx';
import { GeminiLiveMock, isMockMode } from '../lib/geminiLiveMock';
import { useConversation } from '../context/ConversationContext';
import { connect as wsConnect, disconnect as wsDisconnect, sendTextInput as wsSendText, sendAudioChunk as wsSendAudio, setOnStatusUpdateCallback as wsOnStatus, setOnErrorCallback as wsOnError, setOnTranscriptCallback as wsOnTranscript } from '../lib/WebSocketService';
import { AUDIO_SAMPLE_RATE, REALTIME_MODEL, AEC_ENABLED, AGC_ENABLED, NS_ENABLED } from '../config';

export function useGeminiLive({ autoConnect = false, tokenProvider, onUserMessage, onAIMessage }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenOn, setIsScreenOn] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingTimeoutRef = useRef(null);
  // liveMode: 'live' | 'mock'
  const [liveMode, setLiveMode] = useState(isMockMode() ? 'mock' : 'live');
  const [autoFallbackUsed, setAutoFallbackUsed] = useState(false);
  const hasAttemptedLiveRef = useRef(false); // StrictMode duplicate guard

  // Enhanced audio processing state
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioQuality, setAudioQuality] = useState('high'); // 'high', 'medium', 'low'
  const [micPermissionState, setMicPermissionState] = useState('unknown'); // 'granted', 'denied', 'prompt', 'unknown'
  const [audioContextState, setAudioContextState] = useState('suspended'); // 'running', 'suspended', 'closed'
  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetryAttempts = 3;
  const retryDelays = [1000, 2000, 4000]; // Exponential backoff

  const mediaStreamRef = useRef(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const playingRef = useRef(false);
  const frameIntervalRef = useRef(null);
  const clientRef = useRef(null);
  const remoteAudioRef = useRef(null);
  // Always call hooks unconditionally to preserve order
  const conversationCtx = useConversation();
  const replaceLastAIChunkAppendRef = useRef(conversationCtx?.replaceLastAIChunkAppend);
  useEffect(()=>{ replaceLastAIChunkAppendRef.current = conversationCtx?.replaceLastAIChunkAppend; }, [conversationCtx]);

  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      try {
        // Determine optimal sample rate based on audio quality setting
        const sampleRate = getOptimalSampleRate();
        
        // Create audio context with enhanced configuration
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('Web Audio API not supported in this browser');
        }

        audioContextRef.current = new AudioContextClass({ 
          sampleRate,
          latencyHint: audioQuality === 'high' ? 'interactive' : 'balanced'
        });

        // Handle audio context state changes
        audioContextRef.current.addEventListener('statechange', () => {
          setAudioContextState(audioContextRef.current.state);
        });

        setAudioContextState(audioContextRef.current.state);
      } catch (error) {
        console.error('Failed to create audio context:', error);
        setError(`Audio initialization failed: ${error.message}`);
        throw error;
      }
    }

    // Resume audio context if suspended (required for user interaction)
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        setAudioContextState('running');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
        setError('Failed to activate audio system');
        throw error;
      }
    }

    return audioContextRef.current;
  };

  const getOptimalSampleRate = () => {
    switch (audioQuality) {
      case 'high':
        return Math.min(AUDIO_SAMPLE_RATE * 2, 48000); // Up to 32kHz or 48kHz
      case 'medium':
        return AUDIO_SAMPLE_RATE; // 16kHz default
      case 'low':
        return Math.max(AUDIO_SAMPLE_RATE / 2, 8000); // Down to 8kHz
      default:
        return AUDIO_SAMPLE_RATE;
    }
  };

  const checkMicrophonePermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicPermissionState('denied');
        return false;
      }

      // Check current permission state
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          setMicPermissionState(permission.state);
          
          // Listen for permission changes
          permission.addEventListener('change', () => {
            setMicPermissionState(permission.state);
          });

          return permission.state === 'granted';
        } catch (error) {
          // Fallback for browsers that don't support permissions API
          console.warn('Permissions API not available, will attempt direct access');
        }
      }

      // Fallback: attempt to get user media to check permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: AEC_ENABLED,
            autoGainControl: AGC_ENABLED,
            noiseSuppression: NS_ENABLED
          } 
        });
        stream.getTracks().forEach(track => track.stop()); // Clean up test stream
        setMicPermissionState('granted');
        return true;
      } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicPermissionState('denied');
        } else if (error.name === 'NotFoundError') {
          setMicPermissionState('denied');
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setMicPermissionState('denied');
          setError(`Microphone access failed: ${error.message}`);
        }
        return false;
      }
    } catch (error) {
      console.error('Error checking microphone permissions:', error);
      setMicPermissionState('denied');
      setError('Unable to check microphone permissions');
      return false;
    }
  };

  // Buffer for mock streaming -> commit as a single AI message after idle
  const mockBufferRef = useRef('');
  const mockDebounceRef = useRef(null);

  const playLoop = async () => {
    if (playingRef.current) return;
    playingRef.current = true;
    
    try {
      const ctx = await ensureAudioContext();
      
      while (audioQueueRef.current.length > 0) {
        const chunk = audioQueueRef.current.shift();
        try {
          // Enhanced audio decoding with retry logic
          let audioBuffer;
          let decodeAttempts = 0;
          const maxDecodeAttempts = 3;

          while (decodeAttempts < maxDecodeAttempts) {
            try {
              audioBuffer = await ctx.decodeAudioData(chunk.slice(0));
              break;
            } catch (decodeError) {
              decodeAttempts++;
              console.warn(`Audio decode attempt ${decodeAttempts} failed:`, decodeError);
              
              if (decodeAttempts >= maxDecodeAttempts) {
                throw decodeError;
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 100 * decodeAttempts));
            }
          }

          if (audioBuffer) {
            // Create audio source with enhanced configuration
            const src = ctx.createBufferSource();
            src.buffer = audioBuffer;

            // Add gain control for volume management
            const gainNode = ctx.createGain();
            gainNode.gain.value = audioQuality === 'low' ? 0.8 : 1.0;

            // Connect audio graph
            src.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Play audio with error handling
            src.start();
            await new Promise((resolve, reject) => {
              src.onended = resolve;
              src.onerror = reject;
              
              // Timeout fallback
              setTimeout(() => {
                resolve();
              }, audioBuffer.duration * 1000 + 1000);
            });
          }
        } catch (error) {
          console.error('Audio playback error:', error);
          
          // Don't break the entire playback loop for individual chunk errors
          if (error.name === 'EncodingError') {
            console.warn('Skipping corrupted audio chunk');
          } else if (error.name === 'NotSupportedError') {
            console.warn('Audio format not supported, attempting fallback');
            // Could implement format conversion here
          } else {
            console.error('Unexpected audio error:', error);
          }
        }
      }
    } catch (error) {
      console.error('Audio context error in playLoop:', error);
      setError('Audio playback failed. Please check your audio settings.');
    } finally {
      playingRef.current = false;
    }
  };

  const handleAudioChunk = (arrayBuffer) => {
    audioQueueRef.current.push(arrayBuffer);
    playLoop();
  };

  const handleText = (text) => {
    setIsStreaming(true);
    streamingTimeoutRef.current && clearTimeout(streamingTimeoutRef.current);
    streamingTimeoutRef.current = setTimeout(()=> setIsStreaming(false), 800); // ends 800ms after last chunk
    const clean = basicProfanityFilter(text);
    const risks = detectRiskPhrases(clean);
    if (isMockMode()) {
      // Accumulate mock tokens and commit as one message after idle
      mockBufferRef.current += clean;
      if (mockDebounceRef.current) clearTimeout(mockDebounceRef.current);
      mockDebounceRef.current = setTimeout(() => {
        const full = mockBufferRef.current.trim();
        if (full) {
          setTranscript(prev => [...prev, { id: Date.now() + Math.random(), role: 'ai', text: full, risks }]);
          onAIMessage && onAIMessage(full, { risks });
        }
        mockBufferRef.current = '';
      }, 600);
      return;
    }
    // Live mode: either append streaming or push full chunks
    if (replaceLastAIChunkAppendRef.current) {
      replaceLastAIChunkAppendRef.current(clean);
      return;
    }
    setTranscript(prev => [...prev, { id: Date.now() + Math.random(), role: 'ai', text: clean, risks }]);
    onAIMessage && onAIMessage(clean, { risks });
  };

  const connect = useCallback(async () => {
    if (connecting || connected) return;
    setConnecting(true); 
    setError(null);
    setRetryAttempts(0);

  if (liveMode === 'mock' || isMockMode()) {
      try {
    // Do not require AudioContext on connect in mock mode (avoids user-gesture issues)
        
        const ClientClass = GeminiLiveMock;
        clientRef.current = new ClientClass({ 
          onText: handleText, 
          onAudioChunk: handleAudioChunk, 
          onOpen: () => { 
            setConnected(true); 
            setConnecting(false); 
          }, 
          onClose: () => setConnected(false), 
          onError: e => { 
            setError(e); 
            setConnecting(false);
          } 
        });
        await clientRef.current.connect();
      } catch (e) { 
        setError(`Mock connection failed: ${e.message}`); 
        setConnecting(false); 
      }
      return;
    }

    if (hasAttemptedLiveRef.current) {
      // Prevent duplicate immediate second attempt triggered by StrictMode double invoke
      setConnecting(false);
      return;
    }
    hasAttemptedLiveRef.current = true;

    try {
      // Step 1: Check microphone permissions first
      const hasPermission = await checkMicrophonePermissions();
      if (!hasPermission) {
        const permissionError = micPermissionState === 'denied' 
          ? 'Microphone access denied. Please enable microphone permissions in your browser settings and refresh the page.'
          : 'Microphone not available. Please connect a microphone and try again.';
        
        setError(permissionError);
        setConnecting(false);
        return;
      }

      // Step 2: Initialize audio context
      await ensureAudioContext();

      // Step 3: Acquire microphone with enhanced constraints
      let micStream = null;
      try {
        const audioConstraints = {
          audio: {
            echoCancellation: AEC_ENABLED,
            autoGainControl: AGC_ENABLED,
            noiseSuppression: NS_ENABLED,
            sampleRate: getOptimalSampleRate(),
            channelCount: 1, // Mono for efficiency
            latency: audioQuality === 'high' ? 0.01 : 0.02 // Lower latency for high quality
          }
        };

        micStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        if (micStream) {
          setIsMicOn(true);
          setMicPermissionState('granted');
          
          // Start local capture with enhanced processing
          await startAudioCapture(micStream);
        }
      } catch (micError) {
        console.error('Microphone acquisition failed:', micError);
        
        let errorMessage = 'Failed to access microphone: ';
        switch (micError.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage += 'Permission denied. Please allow microphone access and try again.';
            setMicPermissionState('denied');
            break;
          case 'NotFoundError':
            errorMessage += 'No microphone found. Please connect a microphone.';
            break;
          case 'NotReadableError':
            errorMessage += 'Microphone is being used by another application.';
            break;
          case 'OverconstrainedError':
            errorMessage += 'Microphone constraints not supported. Trying with basic settings...';
            // Attempt fallback with basic constraints
            try {
              micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              if (micStream) {
                setIsMicOn(true);
                await startAudioCapture(micStream);
              }
            } catch (fallbackError) {
              errorMessage += ` Fallback also failed: ${fallbackError.message}`;
              throw new Error(errorMessage);
            }
            break;
          default:
            errorMessage += micError.message;
        }
        
        if (!micStream) {
          throw new Error(errorMessage);
        }
      }

      // Step 4: Create WebRTC client with enhanced configuration
      const client = new GeminiWebRtcClient({
        model: REALTIME_MODEL,
        onConnected: () => { 
          setConnected(true); 
          setConnecting(false);
          setRetryAttempts(0);
        },
        onDisconnected: () => {
          setConnected(false);
          // Attempt automatic reconnection for network issues
          if (retryAttempts < maxRetryAttempts) {
            setTimeout(() => {
              setRetryAttempts(prev => prev + 1);
              connect();
            }, retryDelays[retryAttempts] || 4000);
          }
        },
        onError: (e) => { 
          console.error('WebRTC client error:', e);
          setError(`Connection failed: ${e.message}`);
          setConnecting(false);
          
          // Implement retry logic for recoverable errors
          if (retryAttempts < maxRetryAttempts && isRetryableError(e)) {
            setTimeout(() => {
              setRetryAttempts(prev => prev + 1);
              hasAttemptedLiveRef.current = false;
              connect();
            }, retryDelays[retryAttempts] || 4000);
          }
        },
        onTranscript: (text, meta) => {
          if (replaceLastAIChunkAppendRef.current) {
            replaceLastAIChunkAppendRef.current(text + (meta?.isFinal ? '' : ''));
          } else {
            handleText(text);
          }
        },
        onAudioTrack: (stream) => {
          if (!remoteAudioRef.current) {
            const el = document.createElement('audio');
            el.autoplay = true; 
            el.playsInline = true;
            // Enhanced audio element configuration
            el.volume = audioQuality === 'low' ? 0.8 : 1.0;
            document.body.appendChild(el);
            remoteAudioRef.current = el;
          }
          remoteAudioRef.current.srcObject = stream;
        }
      });

      clientRef.current = client;
      
      // Add microphone stream to WebRTC connection
      if (micStream) {
        clientRef.current.addStream(new MediaStream(micStream.getAudioTracks()));
      }
      
      await client.connect();

    } catch (e) {
      console.error('Connection error:', e);
      setError(e.message || 'Connection failed');
      setConnecting(false);
      
      // Auto-fallback to mock mode for development/testing
      if (!autoFallbackUsed && (liveMode === 'live')) {
        setLiveMode('mock');
        setAutoFallbackUsed(true);
        setTimeout(() => { 
          hasAttemptedLiveRef.current = false; 
          connect(); 
        }, 1000);
      }
    }
  }, [connecting, connected, liveMode, audioQuality, micPermissionState, retryAttempts]);

  const isRetryableError = (error) => {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError', 
      'ConnectionError',
      'TemporaryFailure'
    ];
    return retryableErrors.some(type => 
      error.name?.includes(type) || error.message?.includes(type)
    );
  };

  const disconnect = useCallback(() => {
    frameIntervalRef.current && clearInterval(frameIntervalRef.current);
    frameIntervalRef.current = null;
    if (clientRef.current) clientRef.current.close();
    stopMedia();
    setConnected(false);
  }, [liveMode]);

  const retryLive = useCallback(async () => {
    if (connecting) return;
    setLiveMode('live');
    setAutoFallbackUsed(false);
    hasAttemptedLiveRef.current = false;
    disconnect();
    await new Promise(r=> setTimeout(r, 50));
    connect();
  }, [connecting, connect, disconnect]);

  const stopMedia = () => {
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenOn(false);
  };

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        // Check permissions first
        const hasPermission = await checkMicrophonePermissions();
        if (!hasPermission) {
          const errorMsg = micPermissionState === 'denied' 
            ? 'Microphone access denied. Please enable microphone permissions in your browser settings.'
            : 'Microphone not available. Please connect a microphone and try again.';
          setError(errorMsg);
          return;
        }

        // Initialize audio context
        await ensureAudioContext();

        // Get microphone stream with enhanced constraints
        const audioConstraints = {
          audio: {
            echoCancellation: AEC_ENABLED,
            autoGainControl: AGC_ENABLED,
            noiseSuppression: NS_ENABLED,
            sampleRate: getOptimalSampleRate(),
            channelCount: 1
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        
        if (mediaStreamRef.current) {
          stream.getAudioTracks().forEach(track => mediaStreamRef.current.addTrack(track));
        } else {
          mediaStreamRef.current = stream;
        }
        
        // Add to peer connection
        if (clientRef.current && typeof clientRef.current.addStream === 'function') {
          clientRef.current.addStream(new MediaStream(stream.getAudioTracks()));
        }
        
        await startAudioCapture(stream);
        setIsMicOn(true);
        setMicPermissionState('granted');
        
      } catch (error) {
        console.error('Microphone toggle error:', error);
        
        let errorMessage = 'Failed to enable microphone: ';
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage += 'Permission denied. Please allow microphone access in your browser settings.';
            setMicPermissionState('denied');
            break;
          case 'NotFoundError':
            errorMessage += 'No microphone found. Please connect a microphone and try again.';
            break;
          case 'NotReadableError':
            errorMessage += 'Microphone is being used by another application. Please close other applications using the microphone.';
            break;
          case 'OverconstrainedError':
            errorMessage += 'Microphone settings not supported. Please try with a different microphone.';
            break;
          default:
            errorMessage += error.message || 'Unknown error occurred.';
        }
        
        setError(errorMessage);
      }
    } else {
      // Turn off microphone
      try {
        mediaStreamRef.current?.getAudioTracks().forEach(track => {
          track.stop();
          if (mediaStreamRef.current) {
            mediaStreamRef.current.removeTrack(track);
          }
        });
        setIsMicOn(false);
        setAudioLevel(0);
      } catch (error) {
        console.error('Error stopping microphone:', error);
        setError('Failed to stop microphone');
      }
    }
  };

  const startAudioCapture = async (stream) => {
    try {
      const ctx = await ensureAudioContext();
      
      const setupWorklet = async () => {
        try {
          // Enhanced AudioWorklet setup with error handling
          if (ctx.audioWorklet && !ctx.workletModulesLoaded) {
            try {
              await ctx.audioWorklet.addModule('/audio-worklet.js');
              ctx.workletModulesLoaded = true;
            } catch (workletError) {
              console.warn('Failed to load audio worklet module:', workletError);
              throw workletError; // Fall back to ScriptProcessor
            }
          }
          
          if (ctx.workletModulesLoaded) {
            const node = new AudioWorkletNode(ctx, 'pcm-processor');
            
            // Enhanced audio processing with level monitoring
            node.port.onmessage = (e) => {
              const audioData = e.data;
              
              // Calculate audio level for visual feedback
              if (audioData instanceof ArrayBuffer) {
                const view = new DataView(audioData);
                let sum = 0;
                const samples = audioData.byteLength / 2;
                
                for (let i = 0; i < samples; i++) {
                  const sample = view.getInt16(i * 2, true) / 32768;
                  sum += sample * sample;
                }
                
                const rms = Math.sqrt(sum / samples);
                const level = Math.min(1, rms * 10); // Amplify for better visualization
                setAudioLevel(level);
              }
              
              // Send audio data in mock mode
              if (liveMode === 'mock' || isMockMode()) {
                if (!clientRef.current) return;
                clientRef.current.sendAudioPcm(audioData);
              }
              // In live WebRTC mode, audio track is sent via RTCPeerConnection
            };
            
            // Create audio processing chain
            const source = ctx.createMediaStreamSource(stream);
            
            // Add audio level analyzer
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            
            // Connect audio graph: source -> analyser -> worklet
            source.connect(analyser);
            analyser.connect(node);
            
            // Don't connect to destination to avoid feedback
            
            // Start audio level monitoring
            const monitorAudioLevel = () => {
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              
              // Calculate average level
              const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
              const normalizedLevel = average / 255;
              setAudioLevel(normalizedLevel);
              
              // Continue monitoring if microphone is on
              if (isMicOn) {
                requestAnimationFrame(monitorAudioLevel);
              }
            };
            
            monitorAudioLevel();
            return;
          }
        } catch (err) {
          console.warn('AudioWorklet setup failed, falling back to ScriptProcessor:', err);
        }
        
        // Enhanced ScriptProcessor fallback
        const source = ctx.createMediaStreamSource(stream);
        
        // Determine buffer size based on audio quality
        const bufferSize = audioQuality === 'high' ? 512 : 
                          audioQuality === 'medium' ? 1024 : 2048;
        
        const processor = ctx.createScriptProcessor(bufferSize, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const input = e.inputBuffer.getChannelData(0);
          
          // Calculate audio level
          let sum = 0;
          for (let i = 0; i < input.length; i++) {
            sum += input[i] * input[i];
          }
          const rms = Math.sqrt(sum / input.length);
          const level = Math.min(1, rms * 10);
          setAudioLevel(level);
          
          // Process audio for mock mode
          if (liveMode === 'mock' || isMockMode()) {
            if (!clientRef.current) return;
            
            // Convert to PCM with enhanced quality
            const pcm = new ArrayBuffer(input.length * 2);
            const view = new DataView(pcm);
            
            for (let i = 0; i < input.length; i++) {
              // Apply dynamic range compression for better quality
              let sample = Math.max(-1, Math.min(1, input[i]));
              
              // Apply gentle compression to prevent clipping
              if (Math.abs(sample) > 0.8) {
                sample = sample > 0 ? 
                  0.8 + (sample - 0.8) * 0.2 : 
                  -0.8 + (sample + 0.8) * 0.2;
              }
              
              view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            }
            
            clientRef.current.sendAudioPcm(pcm);
          }
          // In live WebRTC mode, audio track is sent automatically
        };
        
        // Connect audio graph
        source.connect(processor);
        // Don't connect processor to destination to avoid feedback
      };
      
      await setupWorklet();
      
    } catch (error) {
      console.error('Audio capture setup failed:', error);
      setError(`Audio processing failed: ${error.message}`);
      throw error;
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        attachVideoStream(stream);
        if (clientRef.current && typeof clientRef.current.addStream === 'function') {
          clientRef.current.addStream(new MediaStream(stream.getVideoTracks()));
        }
        startVideoFrameLoop();
        setIsCameraOn(true);
      } catch (e) { setError('Camera permission denied'); }
    } else {
      stopVideo();
    }
  };

  const toggleScreen = async () => {
    if (!isScreenOn) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        attachVideoStream(stream);
        if (clientRef.current && typeof clientRef.current.addStream === 'function') {
          clientRef.current.addStream(new MediaStream(stream.getVideoTracks()));
        }
        startVideoFrameLoop();
        setIsScreenOn(true);
      } catch (e) { setError('Screen share denied'); }
    } else {
      stopVideo();
    }
  };

  const attachVideoStream = (stream) => {
    mediaStreamRef.current = mediaStreamRef.current || new MediaStream();
    stream.getVideoTracks().forEach(t => mediaStreamRef.current.addTrack(t));
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    frameIntervalRef.current && clearInterval(frameIntervalRef.current);
    frameIntervalRef.current = null;
    setIsCameraOn(false);
    setIsScreenOn(false);
  };

  const startVideoFrameLoop = () => {
    frameIntervalRef.current && clearInterval(frameIntervalRef.current);
    frameIntervalRef.current = setInterval(async () => {
      // With WebRTC, we already send the track; optional frame sending is not required.
      if (!clientRef.current || !videoRef.current) return;
    }, 1000);
  };

  const sendUserText = (text) => {
    if (!text.trim()) return;
    const clean = basicProfanityFilter(text);
    const risks = detectRiskPhrases(clean);
    setTranscript(prev => [...prev, { id: Date.now(), role: 'user', text: clean, risks }]);
    onUserMessage && onUserMessage(clean, { risks });
    if (liveMode==='mock' || isMockMode()) {
      clientRef.current?.sendText(clean);
    } else {
      clientRef.current?.sendText(clean);
    }
  };

  // Audio quality control functions
  const setAudioQualityLevel = useCallback((quality) => {
    if (['high', 'medium', 'low'].includes(quality)) {
      setAudioQuality(quality);
      
      // If connected, restart audio capture with new quality settings
      if (connected && isMicOn && mediaStreamRef.current) {
        const audioTracks = mediaStreamRef.current.getAudioTracks();
        if (audioTracks.length > 0) {
          // Restart audio capture with new settings
          startAudioCapture(mediaStreamRef.current);
        }
      }
    }
  }, [connected, isMicOn]);

  const getAudioQualityInfo = useCallback(() => {
    return {
      current: audioQuality,
      sampleRate: getOptimalSampleRate(),
      options: [
        { value: 'high', label: 'High Quality', sampleRate: Math.min(AUDIO_SAMPLE_RATE * 2, 48000) },
        { value: 'medium', label: 'Medium Quality', sampleRate: AUDIO_SAMPLE_RATE },
        { value: 'low', label: 'Low Quality', sampleRate: Math.max(AUDIO_SAMPLE_RATE / 2, 8000) }
      ]
    };
  }, [audioQuality]);

  const retryConnection = useCallback(async () => {
    if (connecting) return;
    
    setError(null);
    setRetryAttempts(0);
    hasAttemptedLiveRef.current = false;
    
    // Reset permission state to re-check
    setMicPermissionState('unknown');
    
    // Disconnect first, then reconnect
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 500));
    await connect();
  }, [connecting, connect, disconnect]);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    transcript,
    isMicOn,
    isCameraOn,
    isScreenOn,
    videoRef,
    connect,
    disconnect,
    toggleMic,
    toggleCamera,
    toggleScreen,
    sendUserText,
    isStreaming,
    liveMode,
    autoFallbackUsed,
    retryLive,
    // Enhanced audio processing features
    audioLevel,
    audioQuality,
    micPermissionState,
    audioContextState,
    setAudioQualityLevel,
    getAudioQualityInfo,
    retryConnection,
    checkMicrophonePermissions
  };
}
