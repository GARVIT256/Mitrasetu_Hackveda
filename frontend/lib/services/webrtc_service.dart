import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:uuid/uuid.dart';

/// High-level contract for interacting with a single interactive chat session.
/// Responsibilities:
/// 1. Acquire local media (camera + mic, optional screen)
/// 2. Manage a peer connection and signaling via Firestore
/// 3. Expose streams for UI (remote tracks, connection state)
/// 4. Provide methods for screen share start/stop and toggling devices
class WebRTCService {
  static final WebRTCService _instance = WebRTCService._internal();
  factory WebRTCService() => _instance;
  WebRTCService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final _uuid = const Uuid();

  RTCPeerConnection? _pc;
  MediaStream? _localStream;
  MediaStream? _screenStream;

  final _remoteStreamsController = StreamController<MediaStream>.broadcast();
  final _connectionStateController = StreamController<RTCIceConnectionState>.broadcast();

  // Public streams
  Stream<MediaStream> get remoteStreams => _remoteStreamsController.stream;
  Stream<RTCIceConnectionState> get iceConnectionState => _connectionStateController.stream;

  String? _roomId;
  String? get roomId => _roomId;

  bool get isInRoom => _roomId != null;

  Future<void> init() async {
    // Could add permission handling outside; assume already granted.
    if (_pc != null) return;
    final config = {
      'iceServers': [
        {'urls': 'stun:stun.l.google.com:19302'},
      ],
      'sdpSemantics': 'unified-plan'
    };
    _pc = await createPeerConnection(config);

    _pc!.onIceCandidate = (c) async {
      if (c.candidate != null && _roomId != null) {
        await _firestore.collection('rooms').doc(_roomId).collection('callerCandidates').add({
          'candidate': c.candidate,
          'sdpMid': c.sdpMid,
          'sdpMLineIndex': c.sdpMLineIndex,
          'ts': FieldValue.serverTimestamp(),
        });
      }
    };

    _pc!.onTrack = (event) {
      if (event.streams.isNotEmpty) {
        _remoteStreamsController.add(event.streams.first);
      }
    };

    _pc!.onIceConnectionState = (state) {
      _connectionStateController.add(state);
    };
  }

  Future<MediaStream> _createLocalStream({bool audio = true, bool video = true}) async {
    final constraints = {
      'audio': audio,
      'video': video
          ? {
              'facingMode': 'user',
              'width': {'ideal': 1280},
              'height': {'ideal': 720},
              'frameRate': 30,
            }
          : false
    };
    final stream = await navigator.mediaDevices.getUserMedia(constraints);
    return stream;
  }

  Future<MediaStream?> getLocalStream() async {
    if (_localStream != null) return _localStream;
    _localStream = await _createLocalStream();
    for (final track in _localStream!.getTracks()) {
      await _pc?.addTrack(track, _localStream!);
    }
    return _localStream;
  }

  Future<String> createRoom() async {
    await init();
    await getLocalStream();
    final roomRef = _firestore.collection('rooms').doc();
    _roomId = roomRef.id;

    final offer = await _pc!.createOffer();
    await _pc!.setLocalDescription(offer);

    await roomRef.set({
      'offer': {
        'type': offer.type,
        'sdp': offer.sdp,
      },
      'createdAt': FieldValue.serverTimestamp(),
      'active': true,
    });

    // Listen for remote answer
    bool remoteSet = false;
    roomRef.snapshots().listen((snapshot) async {
      if (remoteSet) return;
      final data = snapshot.data();
      if (data == null) return;
      if (data['answer'] != null) {
        final answer = RTCSessionDescription(data['answer']['sdp'], data['answer']['type']);
        try {
          await _pc!.setRemoteDescription(answer);
          remoteSet = true;
        } catch (e) {
          debugPrint('Failed setting remote description: $e');
        }
      }
    });

    // Listen for remote ICE candidates
    roomRef.collection('calleeCandidates').snapshots().listen((snapshot) async {
      for (final doc in snapshot.docChanges) {
        if (doc.type == DocumentChangeType.added) {
          final data = doc.doc.data();
          if (data == null) continue;
          final candidate = RTCIceCandidate(data['candidate'], data['sdpMid'], data['sdpMLineIndex']);
          await _pc?.addCandidate(candidate);
        }
      }
    });

    return _roomId!;
  }

  Future<void> joinRoom(String roomId) async {
    await init();
    await getLocalStream();
    _roomId = roomId;
    final roomRef = _firestore.collection('rooms').doc(roomId);
    final snapshot = await roomRef.get();
    final data = snapshot.data();
    if (data == null || data['offer'] == null) {
      throw StateError('Room offer not found');
    }

    final offer = data['offer'];
    await _pc!.setRemoteDescription(RTCSessionDescription(offer['sdp'], offer['type']));

    final answer = await _pc!.createAnswer();
    await _pc!.setLocalDescription(answer);

    await roomRef.update({
      'answer': {'type': answer.type, 'sdp': answer.sdp},
      'answeredAt': FieldValue.serverTimestamp(),
    });

    // ICE candidates listening (caller side)
    roomRef.collection('callerCandidates').snapshots().listen((snapshot) async {
      for (final doc in snapshot.docChanges) {
        if (doc.type == DocumentChangeType.added) {
          final data = doc.doc.data();
          if (data == null) continue;
          final candidate = RTCIceCandidate(data['candidate'], data['sdpMid'], data['sdpMLineIndex']);
          await _pc?.addCandidate(candidate);
        }
      }
    });

    // Publish callee ICE
    _pc!.onIceCandidate = (c) async {
      if (c.candidate != null) {
        await roomRef.collection('calleeCandidates').add({
          'candidate': c.candidate,
          'sdpMid': c.sdpMid,
          'sdpMLineIndex': c.sdpMLineIndex,
          'ts': FieldValue.serverTimestamp(),
        });
      }
    };
  }

  Future<void> startScreenShare() async {
    if (_screenStream != null) return; // Already running
    try {
      if (kIsWeb) {
        _screenStream = await navigator.mediaDevices.getDisplayMedia({
          'video': true,
          'audio': false,
        });
      } else {
        // Native (Android/iOS) screen capture plugin would be needed.
        // Placeholder: reuse camera constraints or skip.
        debugPrint('Screen share not implemented for this platform yet.');
        return;
      }
      for (final track in _screenStream!.getVideoTracks()) {
        await _pc?.addTrack(track, _screenStream!);
      }
    } catch (e, st) {
      debugPrint('Error starting screen share: $e\n$st');
    }
  }

  Future<void> stopScreenShare() async {
    final stream = _screenStream;
    if (stream == null) return;
    for (final t in stream.getTracks()) {
      t.stop();
    }
    _screenStream = null;
  }

  Future<void> toggleMuteAudio(bool mute) async {
    _localStream?.getAudioTracks().forEach((t) => t.enabled = !mute);
  }

  Future<void> toggleVideo(bool enable) async {
    _localStream?.getVideoTracks().forEach((t) => t.enabled = enable);
  }

  Future<void> hangUp() async {
    try {
      await stopScreenShare();
      _localStream?.getTracks().forEach((t) => t.stop());
      _screenStream?.getTracks().forEach((t) => t.stop());
      await _pc?.close();
    } finally {
      _localStream = null;
      _screenStream = null;
      _pc = null;
      _roomId = null;
    }
  }

  void dispose() {
    _remoteStreamsController.close();
    _connectionStateController.close();
  }
}
