// Local Storage Keys
const LOCAL_STORAGE_SESSION = "planningPokerSession";
const LOCAL_STORAGE_PLAYERS = "planningPokerPlayers";
//const LOCAL_STORAGE_ESTIMATES = "planningPokerEstimates";
const LOCAL_STORAGE_ISSUE_CARDS = "planningPokerIssueCards";
// State
let sessionId = "";
let estimates = [];
let issueCards = [];
let players = [];

// Elements
const sessionIdInput = document.getElementById("session-id-input");
const joinSessionBtn = document.getElementById("join-session-btn");
const playerNameInput = document.getElementById("player-name-input");
const playerRoleSelect = document.getElementById("player-role-select");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
//const estimateInput = document.getElementById("estimate-input");
const submitEstimateBtn = document.getElementById("submit-estimate-btn");
const estimatesList = document.getElementById("estimates-list");
//const teamAverages = document.getElementById("team-averages");
const issueTitleInput = document.getElementById("issue-title-input");
const jiraLinkInput = document.getElementById("jira-link-input");
const issueDescriptionInput = document.getElementById("issue-description-input");
const addIssueCardBtn = document.getElementById("add-issue-card-btn");
const issueCardsList = document.getElementById("issue-cards-list");

// Join a Session
joinSessionBtn.addEventListener("click", () => {
    const session = sessionIdInput.value.trim();
  
    if (!session) {
      alert("Please enter a valid session ID.");
      return;
    }
  
    sessionId = session;
    localStorage.setItem(LOCAL_STORAGE_SESSION, sessionId);
  
    alert(`Joined session: ${sessionId}`);
    loadSessionData();
  });


  addIssueCardBtn.addEventListener("click", () => {
    const title = issueTitleInput.value.trim();
    const link = jiraLinkInput.value.trim();
    const description = issueDescriptionInput.value.trim();
  
    if (!title) {
      alert("Issue title is required.");
      return;
    }
  
    const issueCard = { 
      sessionId, 
      title, 
      link, 
      description, 
      devEstimates: [], 
      qaEstimates: [], 
    };
    
    issueCards.push(issueCard);
    localStorage.setItem(LOCAL_STORAGE_ISSUE_CARDS, JSON.stringify(issueCards));
  
    renderIssueCards();
  
    // Clear inputs
    issueTitleInput.value = "";
    jiraLinkInput.value = "";
    issueDescriptionInput.value = "";
  });

  // Render Issue Cards
function renderIssueCards() {
    issueCardsList.innerHTML = "";
  
    const sessionIssueCards = issueCards.filter(card => card.sessionId === sessionId);
  
    sessionIssueCards.forEach(({ title, link, description }) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
  
      // li.innerHTML = `
      //  <strong>${title}</strong>
     //  ${link ? `<br><a href="${link}" target="_blank">${link}</a>` : ""}
      //  <p>${description}</p>
      //  `;

    li.innerHTML = `
    <h5>${card.title}</h5>
    ${card.link ? `<a href="${card.link}" target="_blank">${card.link}</a>` : ""}
    <p>${card.description}</p>

    <div class="mt-3">
      <label>Dev Team Estimate:</label>
      <input type="number" class="form-control dev-estimate-input" placeholder="Enter estimate">
      <button class="btn btn-primary btn-sm mt-2 dev-submit-btn" data-index="${index}">Submit</button>
      <ul class="dev-estimates-list mt-2">${renderEstimatesList(card.devEstimates)}</ul>
    </div>

    <div class="mt-3">
      <label>QA Team Estimate:</label>
      <input type="number" class="form-control qa-estimate-input" placeholder="Enter estimate">
      <button class="btn btn-primary btn-sm mt-2 qa-submit-btn" data-index="${index}">Submit</button>
      <ul class="qa-estimates-list mt-2">${renderEstimatesList(card.qaEstimates)}</ul>
    </div>

    <div class="mt-3 result-section">
      <strong>Results:</strong>
      <p>Dev Team Average: <span class="dev-average">${calculateAverage(card.devEstimates)}</span></p>
      <p>QA Team Average: <span class="qa-average">${calculateAverage(card.qaEstimates)}</span></p>
      <p>Combined Total (Sum of Averages): <span class="combined-total">${calculateCombinedTotal(card)}</span></p>
    </div>
  `;
  
      issueCardsList.appendChild(li);

      li.querySelector(".dev-submit-btn").addEventListener("click", () => submitEstimate(index, "dev"));
      li.querySelector(".qa-submit-btn").addEventListener("click", () => submitEstimate(index, "qa"));
    });
  }
  

  function renderEstimatesList(estimates) {
    if (!estimates || estimates.length === 0) return "<li>No estimates submitted</li>";
  
    return estimates
      .map(
        ({ playerName, estimate }) =>
          `<li>${playerName}: ${estimate} story points</li>`
      )
      .join("");
  }

  function submitEstimate(cardIndex, team) {
    const card = issueCards[cardIndex];
    const estimateInput =
      team === "dev"
        ? issueCardsList.querySelectorAll(".dev-estimate-input")[cardIndex]
        : issueCardsList.querySelectorAll(".qa-estimate-input")[cardIndex];
  
    const estimate = parseInt(estimateInput.value, 10);
    const playerName = playerNameInput.value.trim();
  
    if (!playerName) {
      alert("Please enter your name before submitting.");
      return;
    }
  
    if (isNaN(estimate)) {
      alert("Please enter a valid estimate.");
      return;
    }
    const estimateEntry = { playerName, estimate };

    if (team === "dev") {
      card.devEstimates.push(estimateEntry);
    } else if (team === "qa") {
      card.qaEstimates.push(estimateEntry);
    }
  
    localStorage.setItem(LOCAL_STORAGE_ISSUE_CARDS, JSON.stringify(issueCards));
    renderIssueCards(); // Re-render the issue cards to update the results
  }
  // Load Existing Issue Cards
function loadIssueCards() {
    issueCards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ISSUE_CARDS)) || [];
    renderIssueCards();
  }
  
  // Update the loadSession function to include issue cards
  function loadSessionData() {
    sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION) || "";
    estimates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ESTIMATES)) || [];
    issueCards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ISSUE_CARDS)) || [];
  
    if (sessionId) {
      sessionIdInput.value = sessionId;
    }
  
    renderEstimates();
    renderIssueCards();
  }
  
  // Initialize the App
  loadSessionData();

  // Add Player Details
addPlayerBtn.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    const playerRole = playerRoleSelect.value;
  
    if (!playerName) {
      alert("Please enter your name.");
      return;
    }

  const player = { sessionId, name: playerName, role: playerRole };
  players.push(player);
  localStorage.setItem(LOCAL_STORAGE_PLAYERS, JSON.stringify(players));

  renderPlayers();

  // Clear inputs
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

  function loadPlayers() {
    players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PLAYERS)) || [];
    renderPlayers();
  }
  
  // Update the loadSession function to include players
  function loadSessionData() {
    sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION) || "";
    estimates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ESTIMATES)) || [];
    issueCards = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ISSUE_CARDS)) || [];
    players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PLAYERS)) || [];
  
    if (sessionId) {
      sessionIdInput.value = sessionId;
    }
  
    renderEstimates();
    renderIssueCards();
    renderPlayers();
  }
  
  // Initialize the App
  loadSessionData();
  
  // Submit Estimate
submitEstimateBtn.addEventListener("click", () => {
  const estimate = parseInt(estimateInput.value, 10);
  const playerName = playerNameInput.value.trim();
  const playerRole = playerRoleSelect.value;

  if (!playerName || !sessionId) {
    alert("Please join a session and add your name before submitting.");
    return;
  }

  if (isNaN(estimate)) {
    alert("Please enter a valid estimate.");
    return;
  }

  // Add estimate
  const estimateEntry = { sessionId, playerName, playerRole, estimate };
  estimates.push(estimateEntry);
  localStorage.setItem(LOCAL_STORAGE_ESTIMATES, JSON.stringify(estimates));

  renderEstimates();
});

// Render Submitted Estimates
function renderEstimates() {
    estimatesList.innerHTML = "";
  
    const sessionEstimates = estimates.filter(e => e.sessionId === sessionId);
    sessionEstimates.forEach(({ playerName, playerRole, estimate }) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.textContent = `${playerName} (${playerRole}): ${estimate} story points`;
      estimatesList.appendChild(li);
    });
  
    calculateTeamAverages(sessionEstimates);
  }

  // Calculate Team Averages
function calculateTeamAverages(sessionEstimates) {
    const teamPoints = { QA: [], PD: [], PM: [] };
  
    sessionEstimates.forEach(({ playerRole, estimate }) => {
      teamPoints[playerRole].push(estimate);
    });
  
    teamAverages.innerHTML = "";
    Object.keys(teamPoints).forEach(team => {
      const avg =
        teamPoints[team].length > 0
          ? (teamPoints[team].reduce((sum, p) => sum + p, 0) / teamPoints[team].length).toFixed(2)
          : 0;
  
      const p = document.createElement("p");
      p.textContent = `${team} Team Average: ${avg}`;
      teamAverages.appendChild(p);
    });
  }
  
  // Load Existing Session Data
function loadSessionData() {
    sessionId = localStorage.getItem(LOCAL_STORAGE_SESSION) || "";
    estimates = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ESTIMATES)) || [];
  
    if (sessionId) {
      sessionIdInput.value = sessionId;
    }
  
    renderEstimates();
  }
  
  // Initialize App
  loadSessionData();