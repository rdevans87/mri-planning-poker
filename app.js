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

  alert(`Joined session: ${sessionId}`);
  loadSessionData();
});

// Add Player
addPlayerBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  const playerRole = playerRoleSelect.value;

  if (!playerName) {
    alert("Please enter your name.");
    return;
  }

  if (players.some(player => player.name === playerName && player.sessionId === sessionId)) {
    alert("Player already exists.");
    return;
  }

  const player = { sessionId, name: playerName, role: playerRole };
  players.push(player);
  localStorage.setItem(LOCAL_STORAGE_PLAYERS, JSON.stringify(players));

  renderPlayers();
  playerNameInput.value = "";
});

// Render Players
function renderPlayers() {
  playerList.innerHTML = "";

  const sessionPlayers = players.filter(player => player.sessionId === sessionId);

  sessionPlayers.forEach(({ name, role }) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = `${name} (${role})`;
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
    const li = document.createElement("li");
    li.className = "list-group-item";

    li.innerHTML = `
      <h5>${card.title}</h5>
      ${card.link ? `<a href="${card.link}" target="_blank">${card.link}</a>` : ""}
      <p>${card.description}</p>

      <div>
        <label>Dev Team Estimate:</label>
        <input type="number" class="form-control dev-estimate-input" placeholder="Enter estimate">
        <button class="btn btn-primary btn-sm mt-2 dev-submit-btn" data-index="${index}">Submit</button>
        <ul class="dev-estimates-list mt-2">${renderEstimatesList(card.devEstimates)}</ul>
      </div>

      <div>
        <label>QA Team Estimate:</label>
        <input type="number" class="form-control qa-estimate-input" placeholder="Enter estimate">
        <button class="btn btn-primary btn-sm mt-2 qa-submit-btn" data-index="${index}">Submit</button>
        <ul class="qa-estimates-list mt-2">${renderEstimatesList(card.qaEstimates)}</ul>
      </div>

      <div class="result-section mt-3">
        <strong>Results:</strong>
        <p>Dev Team Average: ${calculateAverage(card.devEstimates)}</p>
        <p>QA Team Average: ${calculateAverage(card.qaEstimates)}</p>
        <p>Combined Total: ${calculateCombinedTotal(card)}</p>
      </div>
    `;

    issueCardsList.appendChild(li);

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
  const playerName = playerNameInput.value.trim();

  const currentPlayer = players.find(player => player.name === playerName && player.sessionId === sessionId);

  if (!currentPlayer) {
    alert("You must join the session to submit an estimate.");
    return;
  }

  if (isNaN(estimate)) {
    alert("Please enter a valid estimate.");
    return;
  }
  const estimateEntry = { playerName: currentPlayer.name, estimate };

  if (team === "dev") {
    // Prevent duplicate estimates from the same player
    if (card.devEstimates.some(e => e.playerName === currentPlayer.name)) {
      alert("You have already submitted an estimate for this card.");
      return;
    }
    card.devEstimates.push(estimateEntry);
  } else if (team === "qa") {
    // Prevent duplicate estimates from the same player
    if (card.qaEstimates.some(e => e.playerName === currentPlayer.name)) {
      alert("You have already submitted an estimate for this card.");
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

// Load Session Data
function loadSessionData() {
  sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION) || "";
  players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PLAYERS)) || [];
  issueCards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ISSUE_CARDS)) || [];

  if (sessionId) sessionIdInput.value = sessionId;

  renderPlayers();
  renderIssueCards();
}

// Initialize App
loadSessionData();

