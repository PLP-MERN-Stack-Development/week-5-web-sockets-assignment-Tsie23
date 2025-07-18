// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const chatNamespace = io.of('/chat');

// Track users and rooms (move these inside the namespace if needed)
let users = {}; // socket.id -> { username, room }
let roomUsers = {}; // room -> [username]
let messages = {}; // room -> [{ username, message, timestamp, type, filename, file }]
let unreadCounts = {}; // room -> { username -> count }
let registeredUsers = [];
let messageIdCounter = 0;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io namespace connection handler
chatNamespace.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('joinRoom', (room) => {
    let prevRoom = null;
    if (users[socket.id]) {
      // Remove from previous room
      prevRoom = users[socket.id].room;
      if (roomUsers[prevRoom]) {
        roomUsers[prevRoom] = roomUsers[prevRoom].filter(u => u !== users[socket.id].username);
        // Emit system message for leave
        chatNamespace.to(prevRoom).emit('systemMessage', {
          message: `${users[socket.id].username} left the room`,
          timestamp: new Date().toISOString(),
          system: true
        });
      }
      socket.leave(prevRoom);
    }
    socket.join(room);
    users[socket.id] = { username: socket.handshake.query.username, room };
    if (!roomUsers[room]) roomUsers[room] = [];
    if (!roomUsers[room].includes(users[socket.id].username)) {
      roomUsers[room].push(users[socket.id].username);
    }
    if (!unreadCounts[room]) unreadCounts[room] = {};
    unreadCounts[room][users[socket.id].username] = 0;
    chatNamespace.to(room).emit('onlineUsers', roomUsers[room]);
    // Emit system message for join
    chatNamespace.to(room).emit('systemMessage', {
      message: `${users[socket.id].username} joined the room`,
      timestamp: new Date().toISOString(),
      system: true
    });
  });

  // Get online users for a room
  socket.on('getOnlineUsers', (room) => {
    chatNamespace.to(socket.id).emit('onlineUsers', roomUsers[room] || []);
  });

  // Broadcast chat message and store
  socket.on('roomMessage', ({ room, message, username }) => {
    const msgObj = {
      id: messageIdCounter++,
      username,
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
      delivered: false,
      read: false
    };
    if (!messages[room]) messages[room] = [];
    messages[room].push(msgObj);
    // Limit to last 100 messages per room
    if (messages[room].length > 100) messages[room] = messages[room].slice(-100);
    chatNamespace.to(room).emit('chatMessage', msgObj);
    // Delivery acknowledgment
    const senderId = Object.keys(users).find(id => users[id].username === username && users[id].room === room);
    if (senderId) chatNamespace.to(senderId).emit('delivered', { messageId: msgObj.id });
    // Increment unread count for others
    Object.keys(users).forEach(id => {
      if (users[id].room === room && users[id].username !== username) {
        if (!unreadCounts[room]) unreadCounts[room] = {};
        unreadCounts[room][users[id].username] = (unreadCounts[room][users[id].username] || 0) + 1;
        chatNamespace.to(id).emit('unreadCount', unreadCounts[room][users[id].username]);
      }
    });
  });

  // Broadcast file message and store
  socket.on('fileMessage', ({ room, file, filename, username }) => {
    const msgObj = {
      username,
      filename,
      file,
      timestamp: new Date().toISOString(),
      type: 'file'
    };
    if (!messages[room]) messages[room] = [];
    messages[room].push(msgObj);
    if (messages[room].length > 100) messages[room] = messages[room].slice(-100);
    chatNamespace.to(room).emit('fileMessage', msgObj);
  });

  // Broadcast typing indicator
  socket.on('typing', ({ room, username }) => {
    chatNamespace.to(room).emit('userTyping', { username });
  });

  // Message reactions
  socket.on('reactMessage', ({ messageId, reaction, room }) => {
    chatNamespace.to(room).emit('messageReaction', { messageId, reaction });
  });

  // Private messaging
  socket.on('privateMessage', ({ to, message, username, timestamp }) => {
    // Find recipient socket id
    const recipientId = Object.keys(users).find(
      id => users[id].username === to && users[id].room === users[socket.id].room
    );
    if (recipientId) {
      chatNamespace.to(recipientId).emit('privateMessage', { username, message, timestamp });
      chatNamespace.to(socket.id).emit('privateMessage', { username, message, timestamp }); // echo to sender
    }
  });

  // When a user reads messages (e.g., switches to the room)
  socket.on('readMessages', (room) => {
    if (users[socket.id]) {
      unreadCounts[room][users[socket.id].username] = 0;
      socket.emit('unreadCount', 0);
      // Mark all messages as read for this user
      if (messages[room]) {
        messages[room].forEach(msg => { msg.read = true; });
        // Notify sender(s) that their messages have been read
        messages[room].forEach(msg => {
          const senderId = Object.keys(users).find(id => users[id].username === msg.username && users[id].room === room);
          if (senderId) chatNamespace.to(senderId).emit('read', { messageId: msg.id });
        });
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { room, username } = user;
      if (roomUsers[room]) {
        roomUsers[room] = roomUsers[room].filter(u => u !== username);
        chatNamespace.to(room).emit('onlineUsers', roomUsers[room]);
        // Emit system message for leave
        chatNamespace.to(room).emit('systemMessage', {
          message: `${username} left the room`,
          timestamp: new Date().toISOString(),
          system: true
        });
      }
      delete users[socket.id];
    }
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// API route for paginated messages
app.get('/api/messages/:room', (req, res) => {
  const room = req.params.room;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const roomMessages = messages[room] || [];
  const start = Math.max(roomMessages.length - page * pageSize, 0);
  const end = roomMessages.length - (page - 1) * pageSize;
  res.json(roomMessages.slice(start, end));
});

// Registration route
app.post('/api/register', (req, res) => {
  const { username } = req.body;
  if (!username || registeredUsers.includes(username)) {
    return res.status(400).json({ error: 'Username taken or invalid' });
  }
  registeredUsers.push(username);
  res.json({ success: true });
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };