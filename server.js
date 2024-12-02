const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory data store for sessions
const sessions = {};

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a session
  socket.on('joinSession', ({ sessionId, userName, userRole }) => {
    // Create session if it doesn't exist
    if (!sessions[sessionId]) {
      sessions[sessionId] = { users: [], estimates: [] };
    }

    // Add user to the session
    const session = sessions[sessionId];
    session.users.push({ id: socket.id, name: userName, role: userRole });

    // Join the Socket.IO room for the session
    socket.join(sessionId);

    // Notify all users in the session
    io.to(sessionId).emit('sessionData', session);
  });

  // Submit an estimate
  socket.on('submitEstimate', ({ sessionId, issue, estimate }) => {
    const session = sessions[sessionId];
    if (session) {
      session.estimates.push({ issue, estimate });
      io.to(sessionId).emit('sessionData', session);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    for (const sessionId in sessions) {
      const session = sessions[sessionId];
      session.users = session.users.filter((user) => user.id !== socket.id);
      io.to(sessionId).emit('sessionData', session);
    }
  });
});

// Start the server
const PORT = 5500;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});