// Local Storage Keys
const LOCAL_STORAGE_SESSION = "planningPokerSession";
const LOCAL_STORAGE_PLAYERS = "planningPokerPlayers";
const LOCAL_STORAGE_ISSUE_CARDS = "planningPokerIssueCards";

// State
let sessionId = "";
let issueCards = [];
let players = [];
let activePlayer = null;

// Elements
const sessionIdInput = document.getElementById("session-id-input");
const joinSessionBtn = document.getElementById("join-session-btn");
const playerNameInput = document.getElementById("player-name-input");
const playerRoleSelect = document.getElementById("player-role-select");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
const issueTitleInput = document.getElementById("issue-title-input");
const jiraLinkInput = document.getElementById("jira-link-input");
const issueDescriptionInput = document.getElementById("issue-description-input");
const addIssueCardBtn = document.getElementById("add-issue-card-btn");
const issueCardsList = document.getElementById("issue-cards-list");

// Join a Session
joinSessionBtn.addEventListener("click", () => {
  const session = sessionIdInput.value.trim();
  const playerName = playerNameInput.value.trim();
  const playerRole = playerRoleSelect.value;


  if (!session) {
    alert("Please enter a valid session ID.");
    return;
  }

  if (!playerName || !playerRole) {
    alert("Please enter your name and select your role.");
    return;
  }

  sessionId = session;
  localStorage.setItem(LOCAL_STORAGE_SESSION, sessionId);

  if (!players.some(player => player.name === playerName && player.sessionId === sessionId)) {
    const newPlayer = { sessionId, name: playerName, role: playerRole };
    players.push(newPlayer);
    localStorage.setItem(LOCAL_STORAGE_PLAYERS, JSON.stringify(players));
  }

  // Set the active player
  activePlayer = players.find(player => player.name === playerName && player.sessionId === sessionId);
  

  alert(`Joined session: ${sessionId} as ${playerName} (${playerRole})`);
  loadSessionData();
});

function renderPlayers() {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = "";

  const sessionPlayers = players.filter(player => player.sessionId === sessionId);

  sessionPlayers.forEach(({ name, role }) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<span>${name}</span> <span class="badge badge-secondary">${role}</span>`;
    playerList.appendChild(li);
  });
}
// Add Issue Card
addIssueCardBtn.addEventListener("click", () => {
  const title = issueTitleInput.value.trim();
  const link = jiraLinkInput.value.trim();
  const description = issueDescriptionInput.value.trim();

  if (!title) {
    alert("Issue title is required.");
    return;
  }

  const issueCard = { sessionId, title, link, description, devEstimates: [], qaEstimates: [] };
  issueCards.push(issueCard);
  localStorage.setItem(LOCAL_STORAGE_ISSUE_CARDS, JSON.stringify(issueCards));

  renderIssueCards();
  issueTitleInput.value = "";
  jiraLinkInput.value = "";
  issueDescriptionInput.value = "";
});

// Render Issue Cards
function renderIssueCards() {
  issueCardsList.innerHTML = "";

  const sessionIssueCards = issueCards.filter(card => card.sessionId === sessionId);

  sessionIssueCards.forEach((card, index) => {
    const li = document.createElement("div");
    li.className = "col-md-6 mb-4";

    li.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-primary">${card.title}</h5>
          ${card.link ? `<a href="${card.link}" target="_blank" class="card-link">${card.link}</a>` : ""}
          <p class="card-text mt-2">${card.description}</p>
          
          <div class="mt-4">
            <h6 class="text-secondary">Dev Team Estimates</h6>
            <input type="number" class="form-control dev-estimate-input" placeholder="Enter Dev estimate">
            <button class="btn btn-primary btn-sm mt-2 dev-submit-btn" data-index="${index}">Submit</button>
            <ul class="list-group mt-2">${renderEstimatesList(card.devEstimates)}</ul>
          </div>

          <div class="mt-4">
            <h6 class="text-secondary">QA Team Estimates</h6>
            <input type="number" class="form-control qa-estimate-input" placeholder="Enter QA estimate">
            <button class="btn btn-primary btn-sm mt-2 qa-submit-btn" data-index="${index}">Submit</button>
            <ul class="list-group mt-2">${renderEstimatesList(card.qaEstimates)}</ul>
          </div>

          <div class="mt-4 result-section">
            <h6 class="text-secondary">Results</h6>
            <p class="mb-1">Dev Team Average: <span class="text-success">${calculateAverage(card.devEstimates)}</span></p>
            <p class="mb-1">QA Team Average: <span class="text-success">${calculateAverage(card.qaEstimates)}</span></p>
            <p class="font-weight-bold">Combined Total (Sum of Averages): <span class="text-primary">${calculateCombinedTotal(card)}</span></p>
          </div>
        </div>
      </div>
    `;

    issueCardsList.appendChild(li);

    // Event listeners for Dev and QA estimate submissions
    li.querySelector(".dev-submit-btn").addEventListener("click", () => submitEstimate(index, "dev"));
    li.querySelector(".qa-submit-btn").addEventListener("click", () => submitEstimate(index, "qa"));
  });
}
// Render Estimates List
function renderEstimatesList(estimates) {
  if (!estimates.length) return "<li>No estimates submitted</li>";

  return estimates.map(({ playerName, estimate }) => `<li>${playerName}: ${estimate} story points</li>`).join("");
}

// Submit Estimate
function submitEstimate(cardIndex, team) {
  const card = issueCards[cardIndex];
  const estimateInput = issueCardsList.querySelectorAll(
    team === "dev" ? ".dev-estimate-input" : ".qa-estimate-input"
  )[cardIndex];

  const estimate = parseInt(estimateInput.value, 10);
 
  if (!activePlayer) {
    alert("You must join the session to submit an estimate.");
    return;
  }

  if (isNaN(estimate)) {
    alert("Please enter a valid estimate.");
    return;
  }

  const estimateEntry = { playerName: activePlayer.name, estimate };

  if (team === "dev") {
    // Prevent duplicate estimates from the same player
    if (card.devEstimates.some(e => e.playerName === activePlayer.name)) {
      alert("You have already submitted an estimate for this card as a Dev team member.");
      return;
    }
    card.devEstimates.push(estimateEntry);
  } else if (team === "qa") {
    // Prevent duplicate estimates from the same player
    if (card.qaEstimates.some(e => e.playerName === activePlayer.name)) {
      alert("You have already submitted an estimate for this card as a QA team member.");
      return;
    }
    card.qaEstimates.push(estimateEntry);
  }

  localStorage.setItem(LOCAL_STORAGE_ISSUE_CARDS, JSON.stringify(issueCards));
  renderIssueCards(); // Re-render the issue cards to update the results
}

// Calculate Average
function calculateAverage(estimates) {
  if (!estimates.length) return  0;
  const total = estimates.reduce((sum, { estimate }) => sum + estimate, 0);
  return (total / estimates.length).toFixed(2);
}

// Calculate Combined Total (Sum of Averages)
function calculateCombinedTotal(card) {
  const devAvg = parseFloat(calculateAverage(card.devEstimates));
  const qaAvg = parseFloat(calculateAverage(card.qaEstimates));
  return (devAvg + qaAvg).toFixed(2);
}
function loadSessionData() {
  sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION) || "";
  players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PLAYERS)) || [];
  issueCards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ISSUE_CARDS)) || [];

  if (sessionId) {
    sessionIdInput.value = sessionId;
    document.getElementById("current-session").textContent = sessionId;
  }

  renderPlayers();
  renderIssueCards();
}

// Handle New Session
const newSessionBtn = document.getElementById("new-session-btn");

newSessionBtn.addEventListener("click", () => {
  // Clear all localStorage data related to the current session
  localStorage.removeItem(LOCAL_STORAGE_SESSION);
  localStorage.removeItem(LOCAL_STORAGE_PLAYERS);
  localStorage.removeItem(LOCAL_STORAGE_ISSUE_CARDS);

  // Reset state variables
  sessionId = "";
  players = [];
  issueCards = [];
  activePlayer = null;

  // Refresh the page to start a new session
  alert("Starting a new session...");
  window.location.reload();
});

// Initialize App
loadSessionData();

