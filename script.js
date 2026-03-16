const TOTAL_GAMES = 7;
const STORAGE_KEYS = {
  teams: "gameNightTeams",
  scores: "gameNightScores"
};

// Replace this with your live Google Apps Script web app deployment URL.
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const state = {
  teams: {
    team1Name: "Team 1",
    team2Name: "Team 2"
  },
  scores: createDefaultScores()
};

document.addEventListener("DOMContentLoaded", () => {
  cacheInitialState();
  renderGameViews();
  populateFormsFromStorage();
  bindWelcomeForm();
  bindNavigation();
  bindMenuToggle();
  hydrateScoreInputs();
  refreshTeamNames();
  renderFinalScoreboard();
  showView("welcome");
});

function createDefaultScores() {
  return Array.from({ length: TOTAL_GAMES }, (_, index) => ({
    game: index + 1,
    team1Score: 0,
    team2Score: 0
  }));
}

function cacheInitialState() {
  const storedTeams = readLocalStorage(STORAGE_KEYS.teams, null);
  const storedScores = readLocalStorage(STORAGE_KEYS.scores, null);

  if (storedTeams?.team1Name && storedTeams?.team2Name) {
    state.teams = storedTeams;
  }

  if (Array.isArray(storedScores) && storedScores.length === TOTAL_GAMES) {
    state.scores = storedScores.map((score, index) => ({
      game: index + 1,
      team1Score: Number(score.team1Score) || 0,
      team2Score: Number(score.team2Score) || 0
    }));
  }
}

function renderGameViews() {
  const gameViews = document.getElementById("gameViews");
  const template = document.getElementById("gameTemplate");

  for (let gameNumber = 1; gameNumber <= TOTAL_GAMES; gameNumber += 1) {
    const clone = template.content.cloneNode(true);
    const section = clone.querySelector("[data-view]");
    const heading = clone.querySelector(".game-heading");
    const form = clone.querySelector(".score-form");
    const nextButton = clone.querySelector(".next-game-button");

    section.id = `game-${gameNumber}`;
    heading.textContent = `Game ${gameNumber}`;
    form.dataset.game = String(gameNumber);
    nextButton.dataset.game = String(gameNumber);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveGameScore(gameNumber, { showSuccessToast: true });
    });

    nextButton.addEventListener("click", async () => {
      const saved = await saveGameScore(gameNumber, { showSuccessToast: false });

      if (saved) {
        const nextTarget = gameNumber === TOTAL_GAMES ? "final-score" : `game-${gameNumber + 1}`;
        showView(nextTarget);
        showToast(`Game ${gameNumber} saved. Moving on.`, "success");
      }
    });

    gameViews.appendChild(clone);
  }
}

function populateFormsFromStorage() {
  const team1Field = document.getElementById("team1Name");
  const team2Field = document.getElementById("team2Name");

  team1Field.value = state.teams.team1Name === "Team 1" ? "" : state.teams.team1Name;
  team2Field.value = state.teams.team2Name === "Team 2" ? "" : state.teams.team2Name;
}

function bindWelcomeForm() {
  const welcomeForm = document.getElementById("welcomeForm");

  welcomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(welcomeForm);
    const team1Name = sanitizeTeamName(formData.get("team1Name"));
    const team2Name = sanitizeTeamName(formData.get("team2Name"));

    if (!team1Name || !team2Name) {
      showToast("Please enter both team names.", "error");
      return;
    }

    state.teams = { team1Name, team2Name };
    saveLocalStorage(STORAGE_KEYS.teams, state.teams);
    refreshTeamNames();

    const initialized = await sendInitializationToSheets();

    if (initialized) {
      showToast("Teams saved. Competition started.", "success");
      showView("game-1");
    }
  });
}

function bindNavigation() {
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.target);
    });
  });
}

function bindMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    mainNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
  });
}

function hydrateScoreInputs() {
  state.scores.forEach((score) => {
    const section = document.getElementById(`game-${score.game}`);

    if (!section) {
      return;
    }

    section.querySelector(".team1-score-input").value = score.team1Score;
    section.querySelector(".team2-score-input").value = score.team2Score;
  });
}

function refreshTeamNames() {
  document.querySelectorAll(".team-name-1").forEach((element) => {
    element.textContent = state.teams.team1Name;
  });

  document.querySelectorAll(".team-name-2").forEach((element) => {
    element.textContent = state.teams.team2Name;
  });

  document.getElementById("finalTeam1Header").textContent = state.teams.team1Name;
  document.getElementById("finalTeam2Header").textContent = state.teams.team2Name;
}

function showView(viewId) {
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });

  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.target === viewId);
  });

  closeMobileMenu();

  if (viewId === "final-score") {
    renderFinalScoreboard();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  menuToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

async function saveGameScore(gameNumber, options = {}) {
  const section = document.getElementById(`game-${gameNumber}`);
  const team1Score = Number(section.querySelector(".team1-score-input").value);
  const team2Score = Number(section.querySelector(".team2-score-input").value);

  if (!Number.isFinite(team1Score) || !Number.isFinite(team2Score) || team1Score < 0 || team2Score < 0) {
    showToast("Scores must be zero or greater.", "error");
    return false;
  }

  state.scores[gameNumber - 1] = {
    game: gameNumber,
    team1Score,
    team2Score
  };

  saveLocalStorage(STORAGE_KEYS.scores, state.scores);

  const payload = {
    action: "saveScore",
    game: gameNumber,
    team1Name: state.teams.team1Name,
    team2Name: state.teams.team2Name,
    team1Score,
    team2Score
  };

  const sent = await postToAppsScript(payload);

  if (!sent) {
    return false;
  }

  renderFinalScoreboard();

  if (options.showSuccessToast) {
    showToast(`Game ${gameNumber} score saved.`, "success");
  }

  return true;
}

async function sendInitializationToSheets() {
  const payload = {
    action: "initializeTeams",
    team1Name: state.teams.team1Name,
    team2Name: state.teams.team2Name,
    scores: state.scores
  };

  return postToAppsScript(payload);
}

async function postToAppsScript(payload) {
  // The site still works before the endpoint is configured because localStorage remains the fallback source.
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    showToast("Apps Script URL not set yet. Local save completed only.", "error");
    return true;
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Apps Script returned an error.");
    }

    return true;
  } catch (error) {
    console.error("Apps Script request failed:", error);
    showToast("Google Sheets sync failed. Local scores were still saved.", "error");
    return true;
  }
}

function renderFinalScoreboard() {
  const scoreboardBody = document.getElementById("scoreboardBody");
  const winnerCard = document.getElementById("winnerCard");
  const winnerHeadline = document.getElementById("winnerHeadline");
  const winnerMessage = document.getElementById("winnerMessage");

  scoreboardBody.innerHTML = "";

  let totalTeam1 = 0;
  let totalTeam2 = 0;

  state.scores.forEach((score) => {
    totalTeam1 += score.team1Score;
    totalTeam2 += score.team2Score;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>Game ${score.game}</td>
      <td>${score.team1Score}</td>
      <td>${score.team2Score}</td>
    `;
    scoreboardBody.appendChild(row);
  });

  document.getElementById("team1Total").textContent = String(totalTeam1);
  document.getElementById("team2Total").textContent = String(totalTeam2);

  winnerCard.className = "glass-card winner-card";
  winnerCard.classList.add("is-celebrating");

  if (totalTeam1 > totalTeam2) {
    winnerCard.classList.add("is-winner-team-1");
    winnerHeadline.textContent = `${state.teams.team1Name} takes the win!`;
    winnerMessage.textContent = `${state.teams.team1Name} finishes on ${totalTeam1} points, ahead of ${state.teams.team2Name}.`;
  } else if (totalTeam2 > totalTeam1) {
    winnerCard.classList.add("is-winner-team-2");
    winnerHeadline.textContent = `${state.teams.team2Name} takes the win!`;
    winnerMessage.textContent = `${state.teams.team2Name} finishes on ${totalTeam2} points, ahead of ${state.teams.team1Name}.`;
  } else {
    winnerCard.classList.add("is-tie");
    winnerHeadline.textContent = "It's a tie!";
    winnerMessage.textContent = `Both teams finish level on ${totalTeam1} points.`;
  }
}

function showToast(message, type = "success") {
  const toastStack = document.getElementById("toastStack");
  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function sanitizeTeamName(value) {
  return String(value || "").trim();
}

function readLocalStorage(key, fallbackValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallbackValue;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    return fallbackValue;
  }
}

function saveLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
