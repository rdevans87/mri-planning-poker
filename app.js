const socket = io('https://mri-planning-poker.herokuapp.com/');
let sessionId;

function joinSession() {
  const sessionIdInput = document.getElementById('session-id-input').value.trim();
  const playerNameInput = document.getElementById('player-name-input').value.trim();
  const playerRoleInput = document.getElementById('player-role-select').value;

  if (!sessionIdInput || !playerNameInput || !playerRoleInput) {
    alert('Please fill in all fields.');
    return;
  }

  sessionId = sessionIdInput;

  // Save the session data in localStorage
  localStorage.setItem('sessionId', sessionId);
  localStorage.setItem('playerName', playerNameInput);
  localStorage.setItem('playerRole', playerRoleInput);

  // Emit the joinSession event to the server
  socket.emit('joinSession', { sessionId, userName: playerNameInput, userRole: playerRoleInput });
}

window.addEventListener('load', () => {
  const savedSessionId = localStorage.getItem('sessionId');
  const savedPlayerName = localStorage.getItem('playerName');
  const savedPlayerRole = localStorage.getItem('playerRole');

  if (savedSessionId && savedPlayerName && savedPlayerRole) {
    sessionId = savedSessionId;

    // Automatically emit joinSession event
    socket.emit('joinSession', {
      sessionId: savedSessionId,
      userName: savedPlayerName,
      userRole: savedPlayerRole
    });
  }
});

// function startNewSession() {
//   localStorage.removeItem('sessionId');
//   localStorage.removeItem('playerName');
//   localStorage.removeItem('playerRole');
//   location.reload();
// }

// Join a session
//function joinSession() {
  //sessionId = document.getElementById('session-id-input').value.trim();
  //const userName = document.getElementById('player-name-input').value.trim();
  //const userRole = document.getElementById('player-role-select').value;

  //if (!sessionId || !userName || !userRole) {
    //alert('Please fill in all fields.');
    //return;
  //}

  //socket.emit('joinSession', { sessionId, userName, userRole });
//}

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

  issueCards.forEach((card, index) => {
    const devAverage = calculateAverage(card.devEstimates || []);
    const qaAverage = calculateAverage(card.qaEstimates || []);
    const combinedTotal = (parseFloat(devAverage) + parseFloat(qaAverage)).toFixed(2);

    const li = document.createElement('li');
    li.style.marginBottom = '20px';
    li.style.padding = '10px';
    li.style.border = '1px solid #ccc';
    li.style.borderRadius = '5px';

    // Create the content for the issue card
    li.innerHTML = `
     <strong>${card.title}</strong><br>
      <p>${card.description}</p>
      ${card.url ? `<a href="${card.url}" target="_blank" style="color: #007bff; text-decoration: underline;">${card.url}</a>` : ''}
      <div style="margin-top: 10px;">
        <!-- Dev Team Estimate -->
        <label for="dev-estimate-${index}">Dev Team Estimate:</label>
        <input id="dev-estimate-${index}" type="number" placeholder="Enter points" style="width: 80px;">
        <button onclick="submitEstimate(${index}, 'dev')">Submit</button>

        <!-- QA Team Estimate -->
        <label for="qa-estimate-${index}" style="margin-left: 10px;">QA Team Estimate:</label>
        <input id="qa-estimate-${index}" type="number" placeholder="Enter points" style="width: 80px;">
        <button onclick="submitEstimate(${index}, 'qa')">Submit</button>
      </div>

      <!-- Two-Column Layout for Estimates -->
      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <!-- Dev Team Estimates -->
        <div style="flex: 1; margin-right: 10px;">
          <strong>Dev Team Estimates:</strong>
          <ul>${renderPlayerEstimates(card.devEstimates)}</ul>
        </div>

        <!-- QA Team Estimates -->
        <div style="flex: 1;">
          <strong>QA Team Estimates:</strong>
          <<ul>${renderPlayerEstimates(card.qaEstimates)}</ul>
        </div>
      </div>

      <!-- Results Section -->
      <div style="margin-top: 10px;">
        <p>Dev Team Average: <span style="color: #28a745;">${devAverage.toFixed(2)}</span></p>
        <p>QA Team Average: <span style="color: #17a2b8;">${qaAverage.toFixed(2)}</span></p>
        <p style="color: #dc3545; font-weight: bold;">Combined Total: ${combinedTotal}</p>
      </div>
    `;
    // Add the issue card to the list
    issueCardsList.appendChild(li);
  });
}

// Helper function to render player estimates
function renderPlayerEstimates(estimates) {
  if (!estimates || estimates.length === 0) return '<li>No estimates submitted</li>';
  return estimates
    .map(({ playerName, estimate }) => `<li>${playerName}: ${estimate}</li>`)
    .join('');
}
  // Submit Estimate Function
function submitEstimate(cardIndex, team) {
  const inputId = team === 'dev' ? `dev-estimate-${cardIndex}` : `qa-estimate-${cardIndex}`;
  const estimateInput = document.getElementById(inputId);
  const estimate = parseInt(estimateInput.value, 10);
  const playerName = localStorage.getItem('playerName');

  if (isNaN(estimate) || estimate <= 0) {
    alert('Please enter a valid story point estimate.');
    return;
  }

  socket.emit('submitEstimate', { sessionId, cardIndex, team, estimate, playerName });
  estimateInput.value = ''; // Clear the input field
}

// Calculate Average Function
function calculateAverage(estimates) {
  if (!estimates || estimates.length === 0) return 0; // Default to 0 if no estimates
  const sum = estimates.reduce((total, entry) => total + entry.estimate, 0);
  return sum / estimates.length;
}

function startNewSession() {
  // Clear local storage
  localStorage.removeItem('sessionId');
  localStorage.removeItem('playerName');
  localStorage.removeItem('playerRole');

  // Notify the server to clear session data
  if (sessionId) {
    socket.emit('clearSession', { sessionId });
  }

  // Reset frontend state
  sessionId = '';
  document.getElementById('session-id-input').value = '';
  document.getElementById('player-name-input').value = '';
  document.getElementById('player-role-select').value = '';
  document.getElementById('player-list').innerHTML = '';
  document.getElementById('issue-cards-list').innerHTML = '';

  alert('Session has been cleared. You can start a new session.');
}

// function calculateAverage(estimates) {
//   if (!estimates.length) return 0;
//   const sum = estimates.reduce((total, value) => total + value, 0);
//   return (sum / estimates.length).toFixed(2);
// }
