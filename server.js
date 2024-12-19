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
  //socket.on('addIssueCard', ({ sessionId, title, description, url }) => {
   // const session = sessions[sessionId];
   // if (session) {
     // session.issueCards.push({ title, description, url });
     // io.to(sessionId).emit('sessionData', session);
  //  }
  //});

  //socket.on('submitEstimate', ({ sessionId, cardIndex, team, estimate }) => {
    //const session = sessions[sessionId];
    //if (session && session.issueCards[cardIndex]) {
      //if (!session.issueCards[cardIndex][`${team}Estimates`]) {
        //session.issueCards[cardIndex][`${team}Estimates`] = [];
     // }
      //session.issueCards[cardIndex][`${team}Estimates`].push(estimate);
  
      // Broadcast updated session data
      //io.to(sessionId).emit('sessionData', session);
    //}
  //});

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
  socket.on('submitEstimate', ({ sessionId, cardIndex, team, estimate }) => {
    const session = sessions[sessionId];
    if (session && session.issueCards[cardIndex]) {
      const issueCard = session.issueCards[cardIndex];

      if (team === 'dev') {
        issueCard.devEstimates.push(estimate);
      } else if (team === 'qa') {
        issueCard.qaEstimates.push(estimate);
      }

      // Broadcast updated session data to all users in the session
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