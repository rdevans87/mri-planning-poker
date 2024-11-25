// Local Storage Keys
const LOCAL_STORAGE_SESSION = "planningPokerSession";
const LOCAL_STORAGE_ESTIMATES = "planningPokerEstimates";

// State
let sessionId = "";
let estimates = [];

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


