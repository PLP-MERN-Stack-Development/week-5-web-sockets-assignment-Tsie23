// socket.js - Socket.io client setup

import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance (do not autoConnect)
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connect with username as query param
export const connectSocket = (username) => {
  if (!socket.connected) {
    socket.io.opts.query = { username };
    socket.connect();
  }
};

export const joinRoom = (room) => {
  if (socket.connected) socket.emit('joinRoom', room);
};

export const sendRoomMessage = (room, message, username) => {
  if (socket.connected) socket.emit('roomMessage', { room, message, username });
};

export const sendFileMessage = (room, file, filename, username) => {
  if (socket.connected) socket.emit('fileMessage', { room, file, filename, username });
};

export const reactToMessage = (messageId, reaction, room) => {
  if (socket.connected) socket.emit('reactMessage', { messageId, reaction, room });
};

export default socket;