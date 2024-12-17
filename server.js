const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend files
app.use(express.static(__dirname));

// In-memory data store
const sessions = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a session
  socket.on('joinSession', ({ sessionId, userName, userRole }) => {
    if (!sessions[sessionId]) {
      sessions[sessionId] = { users: [], issueCards: [] };
    }
    const session = sessions[sessionId];

    // Add the user
    session.users.push({ id: socket.id, name: userName, role: userRole });
    socket.join(sessionId);
    io.to(sessionId).emit('sessionData', session);
  });

  // Add an issue card
  socket.on('addIssueCard', ({ sessionId, title, description }) => {
    const session = sessions[sessionId];
    if (session) {
      session.issueCards.push({ title, description });
      io.to(sessionId).emit('sessionData', session);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    for (const sessionId in sessions) {
      const session = sessions[sessionId];
      session.users = session.users.filter(user => user.id !== socket.id);
      io.to(sessionId).emit('sessionData', session);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});