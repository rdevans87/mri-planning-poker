// Local Storage Keys
const LOCAL_STORAGE_SESSION = "planningPokerSession";
const LOCAL_STORAGE_ESTIMATES = "planningPokerEstimates";
const LOCAL_STORAGE_ISSUE_CARDS = "planningPokerIssueCards";
// State
let sessionId = "";
let estimates = [];
let issueCards = [];

// Elements
const sessionIdInput = document.getElementById("session-id-input");
const joinSessionBtn = document.getElementById("join-session-btn");
const playerNameInput = document.getElementById("player-name-input");
const playerRoleSelect = document.getElementById("player-role-select");
const addPlayerBtn = document.getElementById("add-player-btn");
const estimateInput = document.getElementById("estimate-input");
const submitEstimateBtn = document.getElementById("submit-estimate-btn");
const estimatesList = document.getElementById("estimates-list");
const teamAverages = document.getElementById("team-averages");
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

  // Add Player Details
addPlayerBtn.addEventListener("click", () => {
    const playerName = playerNameInput.value.trim();
    const playerRole = playerRoleSelect.value;
  
    if (!playerName) {
      alert("Please enter your name.");
      return;
    }
  
    const player = { sessionId, playerName, playerRole };
    alert(`Player added: ${playerName} (${playerRole})`);
  });
  
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