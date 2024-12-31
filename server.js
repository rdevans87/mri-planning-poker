const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import CORS

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Enable CORS
app.use(cors({
  origin: ['https://mri-planning-poker-7a37e47b6257.herokuapp.com', 'http://localhost:300'], // Include your GitHub Pages URL
  methods: ['GET', 'POST'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type'], // Allow specific headers
  credentials: true // If you need cookies or authorization headers
}));

app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// Serve the frontend files
app.use(express.static(__dirname));

// In-memory data store
const sessions = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle joining a session
  socket.on('joinSession', ({ sessionId, userName, userRole }) => {
    if (!sessionId || !userName || !userRole) {
      socket.emit('error', { message: 'Invalid session data.' });
      return;
    }

    if (!sessions[sessionId]) {
      sessions[sessionId] = { users: [], issueCards: [] };
    }

    const session = sessions[sessionId];

    // Avoid duplicate users
    const userExists = session.users.some((user) => user.name === userName);
    if (!userExists) {
      session.users.push({ id: socket.id, name: userName, role: userRole });
    }

    socket.join(sessionId);
    io.to(sessionId).emit('sessionData', session); // Broadcast session data
  });


  // Add an issue card
  socket.on('addIssueCard', ({ sessionId, title, description, url }) => {
    const session = sessions[sessionId];
    if (session) {
      session.issueCards.push({
        title,
        description,
        url,
        devEstimates: [],
        qaEstimates: []
      });
      io.to(sessionId).emit('sessionData', session);
    }
  });

  // Submit a story point estimate
  socket.on('submitEstimate', ({ sessionId, cardIndex, team, estimate, playerName }) => {
    if (!sessionId || typeof cardIndex !== 'number' || !team || !estimate || !playerName) {
      socket.emit('error', { message: 'Invalid estimate data.' });
      return;
    }

    const session = sessions[sessionId];
    if (session && session.issueCards[cardIndex]) {
      const issueCard = session.issueCards[cardIndex];

      const estimateEntry = { playerName, estimate };
      if (team === 'dev') {
        issueCard.devEstimates.push(estimateEntry);
      } else if (team === 'qa') {
        issueCard.qaEstimates.push(estimateEntry);
      }

      io.to(sessionId).emit('sessionData', session); // Broadcast updated session data
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    for (const sessionId in sessions) {
      const session = sessions[sessionId];
      session.users = session.users.filter((user) => user.id !== socket.id);

      io.to(sessionId).emit('sessionData', session); // Notify others in the session
    }
    console.log('User disconnected:', socket.id);
  });

  // Handle clearing a session
  socket.on('clearSession', ({ sessionId }) => {
    if (sessions[sessionId]) {
      delete sessions[sessionId];
      io.to(sessionId).emit('sessionCleared'); // Notify all users in the session
      console.log(`Session ${sessionId} has been cleared.`);
    }
  });
});

// Use the Heroku-provided port or 3000 for local development
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});