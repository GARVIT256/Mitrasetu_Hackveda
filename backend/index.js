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

// Legacy Gemini-specific endpoints disabled for Amazon-only (Bedrock) deployment.
// They are kept as stubs so older frontends fail gracefully instead of 500-ing.

// Health check stub for any old WebRTC integrations
app.get('/api/gemini/webrtc/ping', (req, res) => {
  res.status(200).json({
    ok: true,
    ts: Date.now(),
    note: 'Gemini WebRTC disabled. Use Bedrock-backed /api/chat for AI instead.',
  });
});

// Diagnostics/model listing stub
app.get('/api/gemini/models', (req, res) => {
  res.status(501).json({
    error: 'gemini_disabled',
    note: 'This deployment only uses Amazon Bedrock models (for example, amazon.nova-pro-v1:0).',
  });
});

// Token stub – we no longer expose any API keys to the client
app.get('/api/gemini/token', (req, res) => {
  res.status(501).json({
    error: 'gemini_disabled',
    note: 'Use server-side Amazon Bedrock calls via /api/chat instead of exposing keys.',
  });
});

// Model metadata stub
app.get('/api/gemini/model/:id', (req, res) => {
  res.status(501).json({
    error: 'gemini_disabled',
    note: 'Gemini model metadata is not available in this Amazon-only deployment.',
  });
});

// Single-turn audio stub
app.post('/api/gemini/live/turn', (req, res) => {
  res.status(501).json({
    error: 'gemini_audio_disabled',
    note: 'Real-time audio should be implemented using Amazon Bedrock (Nova Sonic) on the server.',
  });
});

// WebRTC SDP offer proxy stub
app.post('/api/gemini/webrtc/offer', (req, res) => {
  res.status(501).send('Gemini WebRTC offer proxy disabled. Use Amazon Bedrock-backed flows for AI.');
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