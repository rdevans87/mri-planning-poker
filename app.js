const socket = io('http://localhost:3000');
let sessionId;

// Join a session
function joinSession() {
  sessionId = document.getElementById('session-id-input').value.trim();
  const userName = document.getElementById('player-name-input').value.trim();
  const userRole = document.getElementById('player-role-select').value;

  if (!sessionId || !userName || !userRole) {
    alert('Please fill in all fields.');
    return;
  }

  socket.emit('joinSession', { sessionId, userName, userRole });
}

// Add an issue card
function addIssueCard() {
  const issueTitle = document.getElementById('issue-title-input').value.trim();
  const issueDescription = document.getElementById('issue-description-input').value.trim();
  const issueUrl = document.getElementById('issue-url-input').value.trim();

  if (!sessionId || !issueTitle || !issueDescription) {
    alert('Please join a session and fill in all fields.');
    return;
  }
  socket.emit('addIssueCard', { sessionId, title: issueTitle, description: issueDescription, url: issueUrl });

  //document.getElementById('issue-title-input').value = '';
  //document.getElementById('issue-description-input').value = '';
  //document.getElementById('issue-url-input').value = '';
}

// Listen for session updates
socket.on('sessionData', (session) => {
  renderPlayers(session.users);
  renderIssueCards(session.issueCards || []);
});

// Render players in session
function renderPlayers(users) {
  const playerList = document.getElementById('player-list');
  playerList.innerHTML = '';
  users.forEach(({ name, role }) => {
    const li = document.createElement('li');
    li.textContent = `${name} (${role})`;
    playerList.appendChild(li);
  });
}

// Render issue cards
function renderIssueCards(issueCards) {
  const issueCardsList = document.getElementById('issue-cards-list');
  issueCardsList.innerHTML = '';

  issueCards.forEach(({ title, description, url }) => {
    const li = document.createElement('li');
    li.style.marginBottom = '15px'; // Add spacing between issue cards

    // Create the content for the issue card
    li.innerHTML = `
      <strong>${title}</strong><br>
      <p>${description}</p>
    `;

    // If a URL exists, create an <a> element for the clickable link
    if (url) {
      const link = document.createElement('a');
      link.href = url; // Set the link's href
      link.target = '_blank'; // Open the link in a new tab
      link.textContent = 'View Jira Issue';
      link.style.color = '#007bff';
      link.style.textDecoration = 'underline';
      li.appendChild(link); // Append the link to the issue card
    }

    // Add the issue card to the list
    issueCardsList.appendChild(li);
  });
}