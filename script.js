const TOTAL_GAMES = 7;
const DEFAULT_TIMER_SECONDS = 60;
const STORAGE_KEYS = {
  teams: "gameNightTeams",
  scores: "gameNightScores"
};

// Replace this with your live Google Apps Script web app deployment URL.
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const DEFAULT_TEAMS = {
  team1Name: "Drużyna 1",
  team2Name: "Drużyna 2"
};

const GAME_TITLES = [
  "Gra 1: Blef",
  "Gra 2: Ilość nie jakość",
  "Gra 3: Koło fortuny",
  "Gra 4: Kalambury",
  "Gra 5: Wisielec",
  "Gra 6: Znana postać",
  "Gra 7: Już wkrótce"
];

const GAME_SUBTITLES = [
  "Runda odbywa się na żywo, a ekran wspiera prowadzącego.",
  "Plansza pytań, odkrywanie odpowiedzi i odliczanie czasu dla licytacji.",
  "Interaktywne koło fortuny z wynikami dodatnimi, ujemnymi i specjalnymi.",
  "Wsparcie czasowe i zasady dla klasycznej rundy na żywo.",
  "Hasła, litery, zgadywanie fraz oraz koło fortuny w jednym module.",
  "Panel prowadzącego do odejmowania punktów i śledzenia wartości rundy.",
  "Miejsce przygotowane pod następną rozbudowę wieczoru gier."
];

const GAME_2_QUESTIONS = [
  {
    question: "Wymień drużyny piłkarskie grające obecnie w lidze angielskiej:",
    answers: [
      "Arsenal",
      "Manchester City",
      "Manchester United",
      "Aston Villa",
      "Liverpool",
      "Chelsea",
      "Brentford",
      "Everton",
      "Newcastle United",
      "Bournemouth",
      "Fulham",
      "Brighton",
      "Sunderland",
      "Crystal Palace",
      "Leeds United",
      "Tottenham Hotspur",
      "Nottingham Forest",
      "West Ham United",
      "Burnley",
      "Wolverhampton Wanderers"
    ]
  },
  {
    question: "Wymień prezydentów polski:",
    answers: [
      "Wojciech Jaruzelski",
      "Lech Wałęsa",
      "Aleksander Kwaśniewski",
      "Lech Kaczyński",
      "Bronisław Komorowski",
      "Andrzej Duda",
      "Karol Nawrocki"
    ]
  },
  {
    question: "Wymień państwa w UE:",
    answers: [
      "Austria",
      "Belgia",
      "Bułgaria",
      "Chorwacja",
      "Cypr",
      "Czechy",
      "Dania",
      "Estonia",
      "Finlandia",
      "Francja",
      "Grecja",
      "Hiszpania",
      "Holandia",
      "Irlandia",
      "Litwa",
      "Luksemburg",
      "Łotwa",
      "Malta",
      "Niemcy",
      "Polska",
      "Portugalia",
      "Rumunia",
      "Słowacja",
      "Słowenia",
      "Szwecja",
      "Węgry",
      "Włochy"
    ]
  }
];

const GAME_5_PHRASES = [
  { category: "Znani ludzie", phrase: "Tadeusz Rydzyk" },
  { category: "Filozofia", phrase: "Praca czyni wolnym" },
  { category: "Albumy", phrase: "A nu jaho i kóltóra mósi być" }
];

// Repeated entries intentionally shape the wheel probability distribution.
const WHEEL_SEGMENTS = [
  { label: "+1", value: 1, kind: "score", color: "#4cc9f0" },
  { label: "+1", value: 1, kind: "score", color: "#4cc9f0" },
  { label: "+5", value: 5, kind: "score", color: "#49df9f" },
  { label: "+5", value: 5, kind: "score", color: "#49df9f" },
  { label: "+10", value: 10, kind: "score", color: "#ffd166" },
  { label: "+10", value: 10, kind: "score", color: "#ffd166" },
  { label: "+20", value: 20, kind: "score", color: "#ff9966" },
  { label: "-1", value: -1, kind: "score", color: "#7f5cff" },
  { label: "-5", value: -5, kind: "score", color: "#ae49ff" },
  { label: "-10", value: -10, kind: "score", color: "#ff4ec7" },
  { label: "-20", value: -20, kind: "score", color: "#ff6b7d" },
  { label: "piją wszyscy", kind: "event", color: "#00c2ff" },
  { label: "pije twoja drużyna", kind: "event", color: "#38d9a9" },
  { label: "pijesz ty", kind: "event", color: "#f72585" },
  { label: "bankrut", kind: "bankrupt", color: "#111827" }
];

const LETTER_PATTERN = /[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]/;

const state = createInitialState();

document.addEventListener("DOMContentLoaded", () => {
  cacheInitialState();
  renderGameViews();
  populateFormsFromStorage();
  bindWelcomeForm();
  bindNavigation();
  bindMenuToggle();
  bindResetButton();
  hydrateScoreInputs();
  refreshTeamNames();
  renderFinalScoreboard();
  showView("welcome");
});

function createInitialState() {
  return {
    teams: { ...DEFAULT_TEAMS },
    scores: createDefaultScores(),
    game2: createGame2State(),
    game5: createGame5State(),
    game6: createGame6State(),
    ui: {
      timers: {},
      wheels: {}
    }
  };
}

function createDefaultScores() {
  return Array.from({ length: TOTAL_GAMES }, (_, index) => ({
    game: index + 1,
    team1Score: 0,
    team2Score: 0
  }));
}

function createGame2State() {
  return {
    currentQuestion: 0,
    revealedAnswers: GAME_2_QUESTIONS.map((question) => Array(question.answers.length).fill(false))
  };
}

function createGame5State() {
  return {
    phraseIndex: 0,
    guessedLetters: [],
    missedLetters: [],
    roundValue: 0,
    statusMessage: "Zakręć kołem i zacznij zgadywać litery.",
    messageType: "",
    solved: false
  };
}

function createGame6State() {
  return {
    roundScore: 20
  };
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
      team1Score: toInteger(score.team1Score),
      team2Score: toInteger(score.team2Score)
    }));
  }
}

function renderGameViews() {
  clearAllTimers();
  const gameViews = document.getElementById("gameViews");
  const template = document.getElementById("gameTemplate");

  gameViews.innerHTML = "";
  state.ui.timers = {};
  state.ui.wheels = {};

  for (let gameNumber = 1; gameNumber <= TOTAL_GAMES; gameNumber += 1) {
    const clone = template.content.cloneNode(true);
    const section = clone.querySelector("[data-view]");
    const heading = clone.querySelector(".game-heading");
    const subtitle = clone.querySelector(".game-subtitle");
    const stage = clone.querySelector(".game-stage");
    const form = clone.querySelector(".score-form");
    const nextButton = clone.querySelector(".next-game-button");

    section.id = `game-${gameNumber}`;
    heading.textContent = GAME_TITLES[gameNumber - 1];
    subtitle.textContent = GAME_SUBTITLES[gameNumber - 1];
    stage.innerHTML = getGameStageMarkup(gameNumber);
    form.dataset.game = String(gameNumber);
    nextButton.dataset.game = String(gameNumber);
    nextButton.textContent = gameNumber === TOTAL_GAMES ? "Wynik końcowy →" : "Następna gra →";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveGameScore(gameNumber, { showSuccessToast: true });
    });

    nextButton.addEventListener("click", async () => {
      const saved = await saveGameScore(gameNumber, { showSuccessToast: false });

      if (saved) {
        const nextTarget = gameNumber === TOTAL_GAMES ? "final-score" : `game-${gameNumber + 1}`;
        showView(nextTarget);
        showToast(`Zapisano wynik gry ${gameNumber}.`, "success");
      }
    });

    gameViews.appendChild(clone);
    setupGameSection(gameNumber);
  }
}

function getGameStageMarkup(gameNumber) {
  switch (gameNumber) {
    case 1:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">Na żywo</span>
              <span class="inline-pill">Punkty wpisuje prowadzący</span>
            </div>
            <h3>Blef</h3>
            <ol class="rules-list">
              <li>Blef – przed Wami stoją 2 kieliszki. W jednym z nich jest ciepła wódka, w drugim ciepła woda.</li>
              <li>Osoba pijąca musi zwieść drużynę przeciwną.</li>
              <li>Jeżeli uda się oszukać przeciwną drużynę, jej drużyna dostaje 10 pkt, a drużyna przeciwna wypija drugi kieliszek.</li>
              <li>Jeżeli przeciwnicy poprawnie zgadną, oni dostają 10 pkt.</li>
            </ol>
          </article>

          <article class="feature-card placeholder-stage">
            <div>
              <h3>Scena gry</h3>
              <p>
                Ta runda dzieje się w rzeczywistości. Ekran pokazuje zasady i zostawia miejsce
                na prowadzenie zabawy bez dodatkowej mechaniki.
              </p>
            </div>
          </article>
        </div>
      `;
    case 2:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">3 pytania</span>
              <span class="inline-pill">60 sekund</span>
            </div>
            <h3>Ilość nie jakość</h3>
            <ol class="rules-list">
              <li>Zespoły na zmianę licytują się, kto jest w stanie wymienić więcej odpowiedzi dla danego pytania.</li>
              <li>Łącznie będą 3 pytania.</li>
              <li>Odpowiedzi muszą padać po kolei.</li>
              <li>Nie można powiedzieć „pas”.</li>
              <li>Czas na powiedzenie zadeklarowanej liczby haseł wynosi 60 sekund.</li>
              <li>Liczba punktów jest równa liczbie zadeklarowanych haseł.</li>
              <li>Jeżeli drużynie nie uda się podać wszystkich zadeklarowanych haseł, nie zdobywa punktów.</li>
            </ol>
          </article>

          <div class="stage-grid two-columns">
            <article class="feature-card" data-timer-widget="game2">
              <h3>Stoper rundy</h3>
              <div class="timer-display" data-timer-display>01:00</div>
              <div class="timer-controls">
                <button class="primary-button" type="button" data-timer-start>Start</button>
                <button class="ghost-button" type="button" data-timer-pause>Pauza</button>
                <button class="ghost-button" type="button" data-timer-reset>Reset</button>
              </div>
            </article>

            <article class="feature-card">
              <div class="game-meta-bar">
                <span class="question-counter" data-game2-counter>Pytanie 1 z 3</span>
              </div>
              <h3 data-game2-question>Ładowanie pytania...</h3>
              <div class="answers-grid" data-game2-answers></div>
              <div class="mini-action-row">
                <button class="ghost-button" type="button" data-game2-reset>Resetuj pytanie</button>
                <button class="secondary-button" type="button" data-game2-next>Następne pytanie</button>
              </div>
            </article>
          </div>
        </div>
      `;
    case 3:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">Interaktywne koło</span>
              <span class="inline-pill">Wyniki dodatnie i ujemne</span>
            </div>
            <h3>Koło fortuny</h3>
            <ol class="rules-list">
              <li>Na kole są pola punktowe dodatnie, ujemne oraz zdarzenia specjalne.</li>
              <li>Każda drużyna musi minimum raz zakręcić kołem.</li>
              <li>Po pierwszym razie może zdecydować, czy chce kontynuować.</li>
              <li>Maksymalnie można zakręcić kołem 4 razy, chyba że wypadnie bankrut.</li>
            </ol>
          </article>

          ${createWheelMarkup("game3Wheel", "Wynik koła")}
        </div>
      `;
    case 4:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">Na żywo</span>
              <span class="inline-pill">60 sekund</span>
            </div>
            <h3>Kalambury</h3>
            <ol class="rules-list">
              <li>Zwykłe kalambury.</li>
              <li>Zakaz pokazywania na przedmioty.</li>
              <li>Zakaz mówienia i wydawania dźwięków.</li>
              <li>Każde zgadnięte hasło to 2 pkt.</li>
              <li>Łącznie jest 20 haseł.</li>
              <li>Na rundę jest 60 sekund.</li>
              <li>Im więcej haseł, tym więcej punktów.</li>
            </ol>
          </article>

          <div class="stage-grid two-columns">
            <article class="feature-card" data-timer-widget="game4">
              <h3>Timer rundy</h3>
              <div class="timer-display" data-timer-display>01:00</div>
              <div class="timer-controls">
                <button class="primary-button" type="button" data-timer-start>Start</button>
                <button class="ghost-button" type="button" data-timer-pause>Pauza</button>
                <button class="ghost-button" type="button" data-timer-reset>Reset</button>
              </div>
            </article>

            <article class="feature-card placeholder-stage">
              <div>
                <h3>Przestrzeń dla prowadzącego</h3>
                <p>
                  Tutaj masz prosty ekran wspierający kalambury na żywo. Wynik wpisujesz ręcznie
                  po zakończeniu rundy.
                </p>
              </div>
            </article>
          </div>
        </div>
      `;
    case 5:
      return `
        <div class="stage-stack">
          ${createWheelMarkup("game5Wheel", "Stawka rundy")}

          <article class="feature-card phrase-panel">
            <div class="game-meta-bar">
              <span class="question-counter" data-game5-counter>Hasło 1 z 3</span>
              <span class="inline-pill" data-game5-round-value>Aktualna stawka: 0 pkt</span>
            </div>
            <div>
              <p class="phrase-category" data-game5-category>Kategoria</p>
              <h3 data-game5-title>Wisielec</h3>
            </div>
            <div class="masked-phrase" data-game5-phrase></div>

            <div class="stage-grid two-columns">
              <form class="mini-form" data-game5-letter-form>
                <label class="input-card">
                  <span>Podaj jedną literę</span>
                  <input data-game5-letter-input type="text" maxlength="1" placeholder="A">
                </label>
                <button class="secondary-button" type="submit">Sprawdź literę</button>
              </form>

              <form class="mini-form" data-game5-guess-form>
                <label class="input-card">
                  <span>Zgadnij całe hasło</span>
                  <input data-game5-guess-input type="text" placeholder="Wpisz całe hasło">
                </label>
                <button class="primary-button" type="submit">Sprawdź hasło</button>
              </form>
            </div>

            <div class="stage-grid two-columns">
              <article class="feature-card">
                <h4>Trafione litery</h4>
                <div class="letters-grid" data-game5-hit-letters></div>
              </article>

              <article class="feature-card">
                <h4>Nietrafione litery</h4>
                <div class="letters-grid" data-game5-missed-letters></div>
              </article>
            </div>

            <div class="message-box" data-game5-message>
              Zakręć kołem i zacznij zgadywać litery.
            </div>

            <div class="mini-action-row">
              <button class="ghost-button" type="button" data-game5-reset-letters>Resetuj litery</button>
              <button class="secondary-button" type="button" data-game5-next-phrase>Następne hasło</button>
            </div>
          </article>
        </div>
      `;
    case 6:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">Start: 20 pkt</span>
              <span class="inline-pill">Błędne odgadnięcie: -2 pkt</span>
            </div>
            <h3>Znana postać</h3>
            <ol class="rules-list">
              <li>Każda osoba z drużyny może zadawać pytanie po kolei, a przeciwnicy odpowiadają tylko: tak albo nie.</li>
              <li>Pula punktów startuje od 20 pkt.</li>
              <li>Za każde zadane pytanie odejmowany jest 1 pkt.</li>
              <li>Liczba punktów zależy od tego, jak szybko drużyna zgadnie swoją postać.</li>
              <li>Nieprawidłowe odgadnięcie postaci kosztuje -2 pkt.</li>
            </ol>
          </article>

          <div class="support-grid">
            <article class="support-tile">
              <h3>Aktualny wynik rundy</h3>
              <div class="score-display" data-game6-score>20</div>
              <p>Ten wynik możesz potem ręcznie wpisać po odpowiedniej stronie w karcie punktacji.</p>
            </article>

            <article class="support-tile">
              <h3>Szybkie akcje</h3>
              <div class="support-actions">
                <button class="secondary-button" type="button" data-game6-minus-question>Odejmij 1 pkt</button>
                <button class="danger-button" type="button" data-game6-minus-wrong>Odejmij 2 pkt</button>
                <button class="ghost-button" type="button" data-game6-reset>Reset do 20</button>
              </div>
            </article>
          </div>

          <article class="feature-card">
            <h3>Ręczna korekta</h3>
            <form class="score-adjust-form" data-game6-adjust-form>
              <label class="input-card">
                <span>Wpisz korektę punktów</span>
                <input data-game6-adjust-input type="number" step="1" value="0">
              </label>
              <button class="primary-button" type="submit">Zastosuj korektę</button>
            </form>
          </article>
        </div>
      `;
    default:
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="game-meta-bar">
              <span class="inline-pill">Placeholder</span>
              <span class="inline-pill">Gotowe do rozbudowy</span>
            </div>
            <h3>Gra 7</h3>
            <p class="muted-copy">
              Ten ekran pozostaje czystym placeholderem pod kolejną grę. Architektura pozwala
              dodać tu nową mechanikę bez zmiany reszty aplikacji.
            </p>
          </article>

          <article class="feature-card placeholder-stage">
            <div>
              <h3>Scena przyszłej rundy</h3>
              <p>Dodaj tutaj kolejne zasady, quiz albo interaktywną mechanikę w następnej iteracji.</p>
            </div>
          </article>
        </div>
      `;
  }
}

function createWheelMarkup(wheelId, resultLabel) {
  return `
    <div class="wheel-layout">
      <article class="feature-card wheel-visual" data-wheel-widget="${wheelId}">
        <div class="wheel-wrapper">
          <div class="wheel-pointer"></div>
          <div class="wheel-disc" data-wheel-disc></div>
          <div class="wheel-center-cap">SPIN</div>
        </div>
        <button class="primary-button" type="button" data-wheel-spin>Zakręć kołem</button>
        <div class="wheel-legend" data-wheel-legend></div>
      </article>

      <article class="feature-card wheel-result-box">
        <span class="inline-pill">${resultLabel}</span>
        <div class="wheel-result-value" data-wheel-result>Jeszcze nie zakręcono</div>
        <p class="wheel-result-note" data-wheel-note>
          Koło może zwrócić punkty dodatnie, ujemne albo efekt specjalny.
        </p>
      </article>
    </div>
  `;
}

function setupGameSection(gameNumber) {
  const section = document.getElementById(`game-${gameNumber}`);

  if (!section) {
    return;
  }

  switch (gameNumber) {
    case 2:
      setupTimerWidget(section.querySelector('[data-timer-widget="game2"]'), "game2", DEFAULT_TIMER_SECONDS);
      bindGame2(section);
      renderGame2Question();
      break;
    case 3:
      initializeWheelWidget(section.querySelector('[data-wheel-widget="game3Wheel"]'), "game3Wheel", handleGame3WheelResult);
      break;
    case 4:
      setupTimerWidget(section.querySelector('[data-timer-widget="game4"]'), "game4", DEFAULT_TIMER_SECONDS);
      break;
    case 5:
      initializeWheelWidget(section.querySelector('[data-wheel-widget="game5Wheel"]'), "game5Wheel", handleGame5WheelResult);
      bindGame5(section);
      renderGame5();
      break;
    case 6:
      bindGame6(section);
      updateGame6Display();
      break;
    default:
      break;
  }
}

function populateFormsFromStorage() {
  const team1Field = document.getElementById("team1Name");
  const team2Field = document.getElementById("team2Name");

  team1Field.value = state.teams.team1Name === DEFAULT_TEAMS.team1Name ? "" : state.teams.team1Name;
  team2Field.value = state.teams.team2Name === DEFAULT_TEAMS.team2Name ? "" : state.teams.team2Name;
}

function bindWelcomeForm() {
  const welcomeForm = document.getElementById("welcomeForm");

  welcomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(welcomeForm);
    const team1Name = sanitizeTeamName(formData.get("team1Name"));
    const team2Name = sanitizeTeamName(formData.get("team2Name"));

    if (!team1Name || !team2Name) {
      showToast("Wpisz nazwy obu drużyn.", "error");
      return;
    }

    state.teams = { team1Name, team2Name };
    saveLocalStorage(STORAGE_KEYS.teams, state.teams);
    refreshTeamNames();

    const initialized = await sendInitializationToSheets();

    if (initialized) {
      showToast("Drużyny zapisane. Zaczynamy od pierwszej gry.", "success");
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

function bindResetButton() {
  const resetButton = document.getElementById("resetSessionButton");

  resetButton.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Czy na pewno zakończyć grę? Wszystkie lokalne nazwy drużyn i zapisane wyniki zostaną usunięte."
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.teams);
    localStorage.removeItem(STORAGE_KEYS.scores);

    clearAllTimers();
    Object.assign(state, createInitialState());

    renderGameViews();
    populateFormsFromStorage();
    hydrateScoreInputs();
    refreshTeamNames();
    renderFinalScoreboard();
    showView("welcome");
    showToast("Sesja została zresetowana lokalnie.", "success");
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

  if (!Number.isInteger(team1Score) || !Number.isInteger(team2Score)) {
    showToast("Wyniki muszą być liczbami całkowitymi. Mogą być również ujemne.", "error");
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
    showToast(`Wynik gry ${gameNumber} został zapisany.`, "success");
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
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    showToast("Adres Apps Script nie jest jeszcze ustawiony. Zapis lokalny działa.", "error");
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
      throw new Error(result.message || "Apps Script zwrócił błąd.");
    }

    return true;
  } catch (error) {
    console.error("Apps Script request failed:", error);
    showToast("Nie udało się zsynchronizować z Google Sheets. Dane lokalne pozostały zapisane.", "error");
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
      <td>${GAME_TITLES[score.game - 1]}</td>
      <td>${formatSignedNumber(score.team1Score)}</td>
      <td>${formatSignedNumber(score.team2Score)}</td>
    `;
    scoreboardBody.appendChild(row);
  });

  document.getElementById("team1Total").textContent = formatSignedNumber(totalTeam1);
  document.getElementById("team2Total").textContent = formatSignedNumber(totalTeam2);

  winnerCard.className = "glass-card winner-card";
  winnerCard.classList.add("is-celebrating");

  if (totalTeam1 > totalTeam2) {
    winnerCard.classList.add("is-winner-team-1");
    winnerHeadline.textContent = `${state.teams.team1Name} wygrywa!`;
    winnerMessage.textContent = `${state.teams.team1Name} kończy wieczór z wynikiem ${formatSignedNumber(totalTeam1)} i wyprzedza ${state.teams.team2Name}.`;
  } else if (totalTeam2 > totalTeam1) {
    winnerCard.classList.add("is-winner-team-2");
    winnerHeadline.textContent = `${state.teams.team2Name} wygrywa!`;
    winnerMessage.textContent = `${state.teams.team2Name} kończy wieczór z wynikiem ${formatSignedNumber(totalTeam2)} i wyprzedza ${state.teams.team1Name}.`;
  } else {
    winnerCard.classList.add("is-tie");
    winnerHeadline.textContent = "Remis!";
    winnerMessage.textContent = `Obie drużyny kończą z identycznym wynikiem ${formatSignedNumber(totalTeam1)}.`;
  }
}

function bindGame2(section) {
  section.querySelector("[data-game2-reset]").addEventListener("click", () => {
    const currentIndex = state.game2.currentQuestion;
    state.game2.revealedAnswers[currentIndex] = Array(GAME_2_QUESTIONS[currentIndex].answers.length).fill(false);
    renderGame2Question();
  });

  section.querySelector("[data-game2-next]").addEventListener("click", () => {
    if (state.game2.currentQuestion < GAME_2_QUESTIONS.length - 1) {
      state.game2.currentQuestion += 1;
      resetTimer("game2");
      renderGame2Question();
    } else {
      showToast("To było ostatnie pytanie w tej grze.", "success");
    }
  });
}

function renderGame2Question() {
  const section = document.getElementById("game-2");

  if (!section) {
    return;
  }

  const questionIndex = state.game2.currentQuestion;
  const question = GAME_2_QUESTIONS[questionIndex];
  const answersContainer = section.querySelector("[data-game2-answers]");
  const nextButton = section.querySelector("[data-game2-next]");

  section.querySelector("[data-game2-counter]").textContent = `Pytanie ${questionIndex + 1} z ${GAME_2_QUESTIONS.length}`;
  section.querySelector("[data-game2-question]").textContent = question.question;
  answersContainer.innerHTML = "";

  question.answers.forEach((answer, index) => {
    const isRevealed = state.game2.revealedAnswers[questionIndex][index];
    const tile = document.createElement("button");

    tile.type = "button";
    tile.className = `answer-tile ${isRevealed ? "is-revealed" : "is-hidden"}`;
    tile.innerHTML = isRevealed
      ? `<span>${answer}</span>`
      : `<span class="answer-index">${index + 1}</span>`;

    tile.addEventListener("click", () => {
      state.game2.revealedAnswers[questionIndex][index] = !state.game2.revealedAnswers[questionIndex][index];
      renderGame2Question();
    });

    answersContainer.appendChild(tile);
  });

  nextButton.textContent = questionIndex === GAME_2_QUESTIONS.length - 1 ? "To już ostatnie pytanie" : "Następne pytanie";
}

function setupTimerWidget(widget, timerKey, durationSeconds) {
  if (!widget) {
    return;
  }

  if (!state.ui.timers[timerKey]) {
    state.ui.timers[timerKey] = {
      duration: durationSeconds,
      remaining: durationSeconds,
      intervalId: null
    };
  }

  const display = widget.querySelector("[data-timer-display]");
  const startButton = widget.querySelector("[data-timer-start]");
  const pauseButton = widget.querySelector("[data-timer-pause]");
  const resetButton = widget.querySelector("[data-timer-reset]");

  startButton.addEventListener("click", () => startTimer(timerKey, display));
  pauseButton.addEventListener("click", () => pauseTimer(timerKey));
  resetButton.addEventListener("click", () => {
    resetTimer(timerKey);
    updateTimerDisplay(timerKey, display);
  });

  updateTimerDisplay(timerKey, display);
}

function startTimer(timerKey, displayElement) {
  const timer = state.ui.timers[timerKey];

  if (!timer || timer.intervalId) {
    return;
  }

  timer.intervalId = window.setInterval(() => {
    timer.remaining -= 1;
    updateTimerDisplay(timerKey, displayElement);

    if (timer.remaining <= 0) {
      pauseTimer(timerKey);
      timer.remaining = 0;
      updateTimerDisplay(timerKey, displayElement);
      showToast("Czas minął.", "error");
    }
  }, 1000);
}

function pauseTimer(timerKey) {
  const timer = state.ui.timers[timerKey];

  if (!timer?.intervalId) {
    return;
  }

  window.clearInterval(timer.intervalId);
  timer.intervalId = null;
}

function resetTimer(timerKey) {
  const timer = state.ui.timers[timerKey];

  if (!timer) {
    return;
  }

  pauseTimer(timerKey);
  timer.remaining = timer.duration;
}

function updateTimerDisplay(timerKey, displayElement) {
  const timer = state.ui.timers[timerKey];

  if (!timer || !displayElement) {
    return;
  }

  const minutes = String(Math.floor(timer.remaining / 60)).padStart(2, "0");
  const seconds = String(timer.remaining % 60).padStart(2, "0");
  displayElement.textContent = `${minutes}:${seconds}`;
}

function clearAllTimers() {
  Object.values(state.ui.timers).forEach((timer) => {
    if (timer?.intervalId) {
      window.clearInterval(timer.intervalId);
    }
  });
}

function initializeWheelWidget(widget, wheelKey, onResult) {
  if (!widget) {
    return;
  }

  const disc = widget.querySelector("[data-wheel-disc]");
  const legend = widget.querySelector("[data-wheel-legend]");
  const resultValue = widget.parentElement.querySelector("[data-wheel-result]");
  const resultNote = widget.parentElement.querySelector("[data-wheel-note]");
  const spinButton = widget.querySelector("[data-wheel-spin]");

  disc.style.background = buildWheelGradient();
  legend.innerHTML = WHEEL_SEGMENTS.map((segment) => `
    <span class="legend-chip">
      <span class="legend-chip-swatch" style="background:${segment.color}"></span>
      ${segment.label}
    </span>
  `).join("");

  state.ui.wheels[wheelKey] = {
    rotation: 0,
    spinning: false,
    disc,
    resultValue,
    resultNote,
    spinButton
  };

  spinButton.addEventListener("click", () => spinWheel(wheelKey, onResult));
}

function buildWheelGradient() {
  const segmentSize = 360 / WHEEL_SEGMENTS.length;
  const stops = WHEEL_SEGMENTS.map((segment, index) => {
    const start = index * segmentSize;
    const end = (index + 1) * segmentSize;
    return `${segment.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${stops.join(",")})`;
}

function spinWheel(wheelKey, onResult) {
  const wheelState = state.ui.wheels[wheelKey];

  if (!wheelState || wheelState.spinning) {
    return;
  }

  const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  const segment = WHEEL_SEGMENTS[segmentIndex];
  const anglePerSegment = 360 / WHEEL_SEGMENTS.length;
  const currentRotation = wheelState.rotation;
  const targetAngle = (360 - ((segmentIndex * anglePerSegment) + (anglePerSegment / 2))) % 360;
  const normalizedCurrent = currentRotation % 360;
  const additionalRotation = ((targetAngle - normalizedCurrent) + 360) % 360;
  const overshootRotation = currentRotation + (6 * 360) + additionalRotation + 12;
  const finalRotation = overshootRotation - 12;

  wheelState.spinning = true;
  wheelState.spinButton.disabled = true;
  wheelState.resultValue.textContent = "Kręcimy...";
  wheelState.resultNote.textContent = "Koło jeszcze się obraca.";

  wheelState.disc.style.transition = "transform 4.6s cubic-bezier(0.12, 0.85, 0.08, 1)";
  wheelState.disc.style.transform = `rotate(${overshootRotation}deg)`;

  window.setTimeout(() => {
    wheelState.disc.style.transition = "transform 260ms ease-out";
    wheelState.disc.style.transform = `rotate(${finalRotation}deg)`;
  }, 4600);

  window.setTimeout(() => {
    wheelState.rotation = finalRotation;
    wheelState.spinning = false;
    wheelState.spinButton.disabled = false;
    onResult(segment, wheelState);
  }, 4900);
}

function handleGame3WheelResult(segment, wheelState) {
  wheelState.resultValue.textContent = segment.label;
  wheelState.resultNote.textContent = segment.kind === "score"
    ? `Koło wskazało ${formatSignedNumber(segment.value)} pkt.`
    : `Wypadło pole specjalne: ${segment.label}.`;
}

function bindGame5(section) {
  section.querySelector("[data-game5-letter-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    handleGame5LetterGuess(section);
  });

  section.querySelector("[data-game5-guess-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    handleGame5PhraseGuess(section);
  });

  section.querySelector("[data-game5-next-phrase]").addEventListener("click", () => {
    if (state.game5.phraseIndex < GAME_5_PHRASES.length - 1) {
      const nextIndex = state.game5.phraseIndex + 1;
      state.game5 = createGame5State();
      state.game5.phraseIndex = nextIndex;
    } else {
      showToast("To było ostatnie hasło w tej grze.", "success");
      return;
    }

    renderGame5();
    resetWheelResultBox("game5Wheel", "Jeszcze nie zakręcono", "Koło ustali stawkę rundy dla tego hasła.");
  });

  section.querySelector("[data-game5-reset-letters]").addEventListener("click", () => {
    const phraseIndex = state.game5.phraseIndex;
    state.game5 = createGame5State();
    state.game5.phraseIndex = phraseIndex;
    renderGame5();
    resetWheelResultBox("game5Wheel", "Jeszcze nie zakręcono", "Koło ustali stawkę rundy dla tego hasła.");
  });
}

function handleGame5WheelResult(segment, wheelState) {
  if (segment.kind === "score") {
    state.game5.roundValue = segment.value;
    state.game5.statusMessage = `Stawka tej rundy to ${formatSignedNumber(segment.value)} pkt.`;
    state.game5.messageType = "";
    wheelState.resultNote.textContent = "Jeśli drużyna odgadnie hasło, wpisz ten wynik do karty punktacji.";
  } else if (segment.kind === "bankrupt") {
    state.game5.roundValue = 0;
    state.game5.statusMessage = "Bankrut. Stawka rundy wraca do 0 pkt.";
    state.game5.messageType = "is-error";
    wheelState.resultNote.textContent = "Bankrut kończy zbieranie punktów w tej odsłonie.";
  } else {
    state.game5.statusMessage = `Pole specjalne: ${segment.label}. Jeśli trzeba, wynik tej sytuacji wpisz ręcznie.`;
    state.game5.messageType = "";
    wheelState.resultNote.textContent = "Efekt specjalny nie ustawia automatycznie punktów.";
  }

  wheelState.resultValue.textContent = segment.label;
  renderGame5();
}

function renderGame5() {
  const section = document.getElementById("game-5");

  if (!section) {
    return;
  }

  const phraseData = GAME_5_PHRASES[state.game5.phraseIndex];
  const messageBox = section.querySelector("[data-game5-message]");
  const nextButton = section.querySelector("[data-game5-next-phrase]");

  section.querySelector("[data-game5-counter]").textContent = `Hasło ${state.game5.phraseIndex + 1} z ${GAME_5_PHRASES.length}`;
  section.querySelector("[data-game5-category]").textContent = `Kategoria: ${phraseData.category}`;
  section.querySelector("[data-game5-round-value]").textContent = `Aktualna stawka: ${formatSignedNumber(state.game5.roundValue)} pkt`;

  renderMaskedPhrase(section.querySelector("[data-game5-phrase]"), phraseData.phrase);
  renderLettersGrid(section.querySelector("[data-game5-hit-letters]"), state.game5.guessedLetters, false);
  renderLettersGrid(section.querySelector("[data-game5-missed-letters]"), state.game5.missedLetters, true);

  messageBox.textContent = state.game5.statusMessage;
  messageBox.className = `message-box ${state.game5.messageType}`.trim();

  nextButton.textContent = state.game5.phraseIndex === GAME_5_PHRASES.length - 1 ? "To już ostatnie hasło" : "Następne hasło";
}

function renderMaskedPhrase(container, phrase) {
  const revealedSet = new Set(state.game5.guessedLetters.map((letter) => normalizeLetter(letter)));
  const shouldRevealAll = state.game5.solved;

  container.innerHTML = Array.from(phrase).map((character) => {
    if (character === " ") {
      return '<span class="phrase-separator">/</span>';
    }

    if (!LETTER_PATTERN.test(character)) {
      return `<span class="phrase-cell">${character}</span>`;
    }

    const normalizedCharacter = normalizeLetter(character);
    const visibleCharacter = shouldRevealAll || revealedSet.has(normalizedCharacter) ? character.toUpperCase() : "_";
    return `<span class="phrase-cell">${visibleCharacter}</span>`;
  }).join("");
}

function renderLettersGrid(container, letters, missed) {
  container.innerHTML = letters.length
    ? letters.map((letter) => `<span class="letter-chip ${missed ? "missed" : ""}">${letter}</span>`).join("")
    : `<span class="letter-chip ${missed ? "missed" : ""}">-</span>`;
}

function handleGame5LetterGuess(section) {
  const input = section.querySelector("[data-game5-letter-input]");
  const rawValue = sanitizeTeamName(input.value);

  if (!rawValue || rawValue.length !== 1 || !LETTER_PATTERN.test(rawValue)) {
    showToast("Wpisz jedną poprawną literę.", "error");
    return;
  }

  const normalizedLetterValue = normalizeLetter(rawValue);
  const currentPhrase = GAME_5_PHRASES[state.game5.phraseIndex].phrase;
  const phraseLetters = Array.from(currentPhrase).map((letter) => normalizeLetter(letter));

  if (
    state.game5.guessedLetters.some((letter) => normalizeLetter(letter) === normalizedLetterValue) ||
    state.game5.missedLetters.some((letter) => normalizeLetter(letter) === normalizedLetterValue)
  ) {
    showToast("Ta litera była już użyta.", "error");
    input.value = "";
    return;
  }

  if (phraseLetters.includes(normalizedLetterValue)) {
    state.game5.guessedLetters.push(rawValue.toUpperCase());
    state.game5.statusMessage = `Litera ${rawValue.toUpperCase()} występuje w haśle.`;
    state.game5.messageType = "is-success";
  } else {
    state.game5.missedLetters.push(rawValue.toUpperCase());
    state.game5.statusMessage = `Litera ${rawValue.toUpperCase()} nie występuje w haśle.`;
    state.game5.messageType = "is-error";
  }

  input.value = "";
  renderGame5();
}

function handleGame5PhraseGuess(section) {
  const input = section.querySelector("[data-game5-guess-input]");
  const guess = sanitizeTeamName(input.value);
  const targetPhrase = GAME_5_PHRASES[state.game5.phraseIndex].phrase;

  if (!guess) {
    showToast("Wpisz całe hasło.", "error");
    return;
  }

  if (normalizePhrase(guess) === normalizePhrase(targetPhrase)) {
    state.game5.solved = true;
    state.game5.statusMessage = `Poprawnie. Hasło odkryte. Stawka rundy: ${formatSignedNumber(state.game5.roundValue)} pkt.`;
    state.game5.messageType = "is-success";
  } else {
    state.game5.statusMessage = "To nie jest poprawne hasło.";
    state.game5.messageType = "is-error";
  }

  input.value = "";
  renderGame5();
}

function resetWheelResultBox(wheelKey, valueText, noteText) {
  const wheelState = state.ui.wheels[wheelKey];

  if (!wheelState) {
    return;
  }

  wheelState.resultValue.textContent = valueText;
  wheelState.resultNote.textContent = noteText;
}

function bindGame6(section) {
  section.querySelector("[data-game6-minus-question]").addEventListener("click", () => {
    state.game6.roundScore -= 1;
    updateGame6Display();
  });

  section.querySelector("[data-game6-minus-wrong]").addEventListener("click", () => {
    state.game6.roundScore -= 2;
    updateGame6Display();
  });

  section.querySelector("[data-game6-reset]").addEventListener("click", () => {
    state.game6.roundScore = 20;
    updateGame6Display();
  });

  section.querySelector("[data-game6-adjust-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = section.querySelector("[data-game6-adjust-input]");
    const adjustment = Number(input.value);

    if (!Number.isInteger(adjustment)) {
      showToast("Korekta musi być liczbą całkowitą.", "error");
      return;
    }

    state.game6.roundScore += adjustment;
    input.value = "0";
    updateGame6Display();
  });
}

function updateGame6Display() {
  const scoreElement = document.querySelector("[data-game6-score]");

  if (!scoreElement) {
    return;
  }

  scoreElement.textContent = formatSignedNumber(state.game6.roundScore);
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

function formatSignedNumber(value) {
  return value > 0 ? `+${value}` : String(value);
}

function normalizeLetter(value) {
  return String(value || "").trim().toLocaleUpperCase("pl-PL");
}

function normalizePhrase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("pl-PL");
}

function sanitizeTeamName(value) {
  return String(value || "").trim();
}

function toInteger(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : 0;
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
