const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(express.text({ type: ['application/sdp', 'text/plain'], limit: '2mb' }));
app.use(cors());

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

// Define Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/screening', require('./routes/screening'));
app.use('/api/circle', require('./routes/circle'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/escalate', require('./routes/escalate'));

// Health check for webrtc route group
app.get('/api/gemini/webrtc/ping', (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// Diagnostics: list available Gemini models (server-side; do NOT expose in prod)
app.get('/api/gemini/models', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    const fetch = (await import('node-fetch')).default;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, { method: 'GET' });
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch (e) {
    console.error('models list failed', e);
    return res.status(500).json({ error: 'models_list_failed' });
  }
});

// Simple token endpoint for frontend WS client (development only)
// Returns { token: GEMINI_API_KEY }. In production, mint short-lived tokens instead.
app.get('/api/gemini/token', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  return res.status(200).json({ token: apiKey });
});

// Diagnostics: fetch single model metadata
app.get('/api/gemini/model/:id', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    const fetch = (await import('node-fetch')).default;
    const id = req.params.id;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, { method: 'GET' });
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch (e) {
    console.error('model get failed', e);
    return res.status(500).json({ error: 'model_get_failed' });
  }
});

// Single-turn Live audio endpoint using @google/genai (server-side)
// POST /api/gemini/live/turn  Content-Type: audio/wav or multipart/form-data with 'file'
app.post('/api/gemini/live/turn', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    // Collect raw body bytes (express.json/text already configured; ensure raw)
    let bytes = [];
    req.on('data', chunk => bytes.push(chunk));
    await new Promise(resolve => req.on('end', resolve));
    if (!bytes.length) return res.status(400).json({ error: 'Empty body' });
    const buffer = Buffer.concat(bytes);

    // Lazy import deps to avoid cold cost
    const { GoogleGenAI, Modality } = await import('@google/genai');
    const wavePkg = await import('wavefile');
    const { WaveFile } = wavePkg;

    // Resample to 16k mono 16-bit PCM
    const wav = new WaveFile();
    try { wav.fromBuffer(buffer); } catch { return res.status(400).json({ error: 'Invalid WAV data' }); }
    wav.toSampleRate(16000);
    wav.toBitDepth('16');
    const base64Audio = wav.toBase64();

    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-preview-native-audio-dialog';
    const config = {
      responseModalities: [Modality.AUDIO],
      systemInstruction: 'You are a helpful assistant and answer in a friendly tone.'
    };

    const responseQueue = [];
    const session = await ai.live.connect({
      model,
      config,
      callbacks: {
        onopen: () => {},
        onmessage: (m) => responseQueue.push(m),
        onerror: (e) => { console.error('live.connect error', e); },
        onclose: () => {}
      }
    });

    // Send realtime input
    session.sendRealtimeInput({ audio: { data: base64Audio, mimeType: 'audio/pcm;rate=16000' } });

    // Helper to drain until turnComplete
    const waitMessage = () => new Promise((resolve) => {
      const poll = () => {
        const m = responseQueue.shift();
        if (m) return resolve(m);
        setTimeout(poll, 50);
      };
      poll();
    });
    const turns = [];
    let done = false;
    while (!done) {
      const msg = await waitMessage();
      turns.push(msg);
      if (msg.serverContent && msg.serverContent.turnComplete) done = true;
    }

    // Aggregate audio chunks
    const combined = turns.reduce((acc, turn) => {
      if (turn.data) {
        const b = Buffer.from(turn.data, 'base64');
        const arr = new Int16Array(b.buffer, b.byteOffset, b.byteLength / Int16Array.BYTES_PER_ELEMENT);
        return acc.concat(Array.from(arr));
      }
      return acc;
    }, []);

    const outPcm = new Int16Array(combined);
    const outWav = new WaveFile();
    // API typically returns 24kHz; write 24kHz WAV for playback
    outWav.fromScratch(1, 24000, '16', outPcm);
    res.setHeader('Content-Type', 'audio/wav');
    return res.status(200).send(Buffer.from(outWav.toBuffer()));
  } catch (e) {
    console.error('live/turn failed', e);
    return res.status(502).json({ error: 'live_turn_failed' });
  }
});

// Gemini Multimodal Live: WebRTC SDP offer -> answer proxy
// Client sends SDP offer as text/plain or application/sdp in body
// Optional query params: model (defaults to gemini-2.5-flash-preview-native-audio-dialog)
app.post('/api/gemini/webrtc/offer', async (req, res) => {
  try {
    console.log('[/api/gemini/webrtc/offer] hit', { ct: req.get('content-type'), len: (req.body||'').length });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).send('Missing GEMINI_API_KEY');

    const defaultModel = (process.env.GEMINI_REALTIME_MODEL || 'models/gemini-2.5-flash').toString();
    const model = (req.query.model || defaultModel).toString();
    const offerSdp = req.body || '';
  console.log('Received SDP offer length:', offerSdp.length);
    if (!offerSdp.trim()) return res.status(400).send('Empty SDP offer');

    const override = process.env.GEMINI_REALTIME_SDP_URL; // optional full URL override (full URL)
    const fetch = (await import('node-fetch')).default;

    const maskKey = (k) => (k ? `${String(k).slice(0, 6)}…${String(k).slice(-4)}` : 'n/a');
    const tryPost = async (fullUrl) => {
      const safeUrl = fullUrl.replace(encodeURIComponent(apiKey), '[REDACTED]');
      console.log('Posting SDP to upstream:', safeUrl);
      const r = await fetch(fullUrl, { method: 'POST', headers: { 'Content-Type': 'application/sdp' }, body: offerSdp });
      const text = await r.text();
      return { r, text };
    };

    let response = null;
    let bodyText = '';
    if (override) {
      ({ r: response, text: bodyText } = await tryPost(override));
    } else {
      const candidates = [];
      // Start with requested/selected model
      const requested = model;
      candidates.push(requested);
      // Add a few common realtime-capable fallbacks
      ['models/gemini-2.5-flash', 'models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro'].forEach((m) => {
        if (!candidates.includes(m)) candidates.push(m);
      });
      for (const m of candidates) {
        const url = `https://generativelanguage.googleapis.com/v1beta/${encodeURIComponent(m)}:connect?alt=sdp&key=${encodeURIComponent(apiKey)}`;
        const { r, text } = await tryPost(url);
        if (r.ok) { response = r; bodyText = text; break; }
        console.warn('Upstream :connect returned', r.status, 'for model', m);
      }
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 502;
      console.error('Gemini webrtc error', status, bodyText?.slice?.(0, 500) || bodyText);
      // Provide structured error to client for easier debugging
      return res.status(status).json({ error: 'webrtc_connect_failed', status, note: 'Model may not support realtime connect for your key or is not enabled.' });
    }
    res.setHeader('Content-Type', 'application/sdp');
    return res.status(200).send(bodyText);
  } catch (e) {
    console.error('webrtc/offer proxy failed', e);
    return res.status(500).send('Offer proxy failed');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity; adjust in production
  },
});

const MAX_USERS_PER_ROOM = 10;
const rooms = new Map(); // Store room data: { id, name, users: Map, userCount }

// Initialize with some default rooms
const defaultRooms = [
  { id: 'general', name: 'General Chat' },
  { id: 'help', name: 'Help & Support' },
  { id: 'random', name: 'Random Talk' }
];

defaultRooms.forEach(room => {
  rooms.set(room.id, {
    ...room,
    users: new Map(),
    userCount: 0
  });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send available rooms to client
  socket.on('get_rooms', () => {
    const roomsList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.userCount
    }));
    socket.emit('rooms_list', roomsList);
  });

  // Create new room
  socket.on('create_room', (roomData) => {
    const { name, id } = roomData;
    
    if (!rooms.has(id)) {
      const newRoom = {
        id,
        name,
        users: new Map(),
        userCount: 0
      };
      rooms.set(id, newRoom);
      
      // Broadcast new room to all clients
      io.emit('room_created', {
        id,
        name,
        userCount: 0
      });
      
      console.log(`New room created: ${name} (${id})`);
    }
  });

  // Join specific room
  socket.on('join_room', (data) => {
    const { username, role, roomId } = data;
    
    if (!rooms.has(roomId)) {
      // Create room if it doesn't exist
      rooms.set(roomId, {
        id: roomId,
        name: roomId.replace(/-/g, ' '),
        users: new Map(),
        userCount: 0
      });
    }

    const room = rooms.get(roomId);

    // Check if room is full
    if (room.userCount >= MAX_USERS_PER_ROOM) {
      socket.emit('room_full', `Room ${room.name} is full (${MAX_USERS_PER_ROOM} users max).`);
      return;
    }

    // Leave any previous room
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      const prevRoom = rooms.get(socket.currentRoom);
      if (prevRoom && prevRoom.users.has(socket.id)) {
        prevRoom.users.delete(socket.id);
        prevRoom.userCount--;
        socket.to(socket.currentRoom).emit('user_left', {
          message: `${socket.username} has left the room.`,
          count: prevRoom.userCount
        });
      }
    }

    // Join new room
    socket.join(roomId);
    socket.currentRoom = roomId;
    socket.username = username;
    socket.role = role;

    // Add user to room
    room.users.set(socket.id, { username, role });
    room.userCount++;

    // Send room info to the user
    socket.emit('room_info', { name: room.name, id: room.id });
    
    // Notify room about new user
    socket.to(roomId).emit('user_joined', {
      message: `${username} has joined the room.`,
      count: room.userCount
    });

    // Send current user count to the joiner
    socket.emit('online_count', room.userCount);

    console.log(`${username} joined room: ${room.name} (${room.userCount} users)`);
  });


  socket.on('delete_room', (roomId) => {
  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);

  // Kick everyone out of the room
  for (const [sid] of room.users) {
    const s = io.sockets.sockets.get(sid);
    if (s) {
      s.leave(roomId);
      if (s.currentRoom === roomId) s.currentRoom = null;
      s.emit('room_deleted_notice', { roomId, name: room.name });
    }
  }

  // Remove the room from memory
  rooms.delete(roomId);

  // Notify all clients so UIs update
  io.emit('room_deleted', roomId);

  console.log(`Room deleted: ${room.name} (${roomId})`);
});


  // Handle chat messages
  socket.on('chat_message', (msg) => {
    if (socket.currentRoom) {
      // Broadcast to all users in the room
      io.to(socket.currentRoom).emit('chat_message', msg);
    }
  });

  // Leave room
  socket.on('leave_room', (roomId) => {
    if (socket.currentRoom === roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.userCount--;
        
        socket.leave(roomId);
        socket.to(roomId).emit('user_left', {
          message: `${socket.username} has left the room.`,
          count: room.userCount
        });

        socket.currentRoom = null;
        console.log(`${socket.username} left room: ${room.name}`);
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.currentRoom && rooms.has(socket.currentRoom)) {
      const room = rooms.get(socket.currentRoom);
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        room.userCount--;
        
        socket.to(socket.currentRoom).emit('user_left', {
          message: `${socket.username || 'A user'} has left the room.`,
          count: room.userCount
        });

        console.log(`User disconnected from room: ${room.name} (${room.userCount} users remaining)`);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 5000;

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});