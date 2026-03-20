const DEFAULT_TIMER_SECONDS = 60;
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const STORAGE_KEYS = {
  teams: "gameNightTeams",
  scores: "gameNightScores"
};

const DEFAULT_TEAMS = {
  team1Name: "Drużyna 1",
  team2Name: "Drużyna 2"
};

const ROUND_CONFIG = [
  { id: "game-1", navLabel: "Gra 1", title: "Gra 1: Blef", summaryLabel: "Gra 1", kind: "game", layout: "compact", type: "blef" },
  { id: "music-1", navLabel: "Kącik muzyczny 1", title: "Kącik muzyczny", summaryLabel: "Kącik muzyczny 1", kind: "intermission", layout: "compact", type: "music", ordinal: 1 },
  { id: "game-2", navLabel: "Gra 2", title: "Gra 2: Ilość nie jakość", summaryLabel: "Gra 2", kind: "game", layout: "split", type: "quantity" },
  { id: "acting-1", navLabel: "Odegraj postać 1", title: "Odegraj postać", summaryLabel: "Odegraj postać 1", kind: "intermission", layout: "compact", type: "acting", ordinal: 1 },
  { id: "game-3", navLabel: "Gra 3", title: "Gra 3: Jaka to melodia", summaryLabel: "Gra 3: Jaka to melodia", kind: "game", layout: "compact", type: "melody" },
  { id: "music-2", navLabel: "Kącik muzyczny 2", title: "Kącik muzyczny", summaryLabel: "Kącik muzyczny 2", kind: "intermission", layout: "compact", type: "music", ordinal: 2 },
  { id: "game-4", navLabel: "Gra 4", title: "Gra 4: Kalambury", summaryLabel: "Gra 4", kind: "game", layout: "compact", type: "charades" },
  { id: "acting-2", navLabel: "Debata", title: "Debata", summaryLabel: "Debata", kind: "intermission", layout: "compact", type: "debate", ordinal: 2 },
  { id: "game-5", navLabel: "Gra 5", title: "Gra 5: Wisielec", summaryLabel: "Gra 5", kind: "game", layout: "split", type: "hangman" },
  { id: "music-3", navLabel: "Kącik muzyczny 3", title: "Kącik muzyczny", summaryLabel: "Kącik muzyczny 3", kind: "intermission", layout: "compact", type: "music", ordinal: 3 },
  { id: "game-6", navLabel: "Gra 6", title: "Gra 6: Znana postać", summaryLabel: "Gra 6", kind: "game", layout: "compact", type: "famous-person" }
];

const GAME_2_QUESTIONS = [
  {
    question: "Wymień drużyny piłkarskie grające obecnie w lidze angielskiej:",
    answers: [
      "Arsenal", "Manchester City", "Manchester United", "Aston Villa", "Liverpool",
      "Chelsea", "Brentford", "Everton", "Newcastle United", "Bournemouth",
      "Fulham", "Brighton", "Sunderland", "Crystal Palace", "Leeds United",
      "Tottenham Hotspur", "Nottingham Forest", "West Ham United", "Burnley", "Wolverhampton Wanderers"
    ]
  },
  {
    question: "Wymień prezydentów polski:",
    answers: [
      "Wojciech Jaruzelski", "Lech Wałęsa", "Aleksander Kwaśniewski", "Lech Kaczyński",
      "Bronisław Komorowski", "Andrzej Duda", "Karol Nawrocki"
    ]
  },
  {
    question: "Wymień państwa w UE:",
    answers: [
      "Austria", "Belgia", "Bułgaria", "Chorwacja", "Cypr", "Czechy", "Dania",
      "Estonia", "Finlandia", "Francja", "Grecja", "Hiszpania", "Holandia", "Irlandia",
      "Litwa", "Luksemburg", "Łotwa", "Malta", "Niemcy", "Polska", "Portugalia",
      "Rumunia", "Słowacja", "Słowenia", "Szwecja", "Węgry", "Włochy"
    ]
  }
];

const GAME_5_PHRASES = [
  { category: "Znani ludzie", phrase: "Tadeusz Rydzyk" },
  { category: "Filozofia", phrase: "Praca czyni wolnym" },
  { category: "Albumy", phrase: "A nu jaho i kóltóra mósi być" }
];

const GAME_3_CATEGORIES = [
  { label: "Owady", artist: "Manam", title: "Cykady na cykadach" },
  { label: "Jezu Chrystus", artist: "Quebonafide", title: "Ciernie" },
  { label: "Afirmacja", artist: "Sylwia Grzeszczak", title: "Małe Rzeczy" },
  { label: "Emigracja", artist: "Big Cyc", title: "Makumba" }
];

const DEBATE_TOPICS = [
  "Adrian Konrad powinien otrzymać pokojową nagrodę Nobla",
  "Ślizg nie jest zabawnym ani pouczającym filmem"
];

const WHEEL_SEGMENTS = [
  { label: "+5", value: 5, kind: "score", color: "#4cdfa2" },
  { label: "Skip", kind: "skip", color: "#3b4f93" },
  { label: "-1", value: -1, kind: "score", color: "#7f5cff" },
  { label: "+10", value: 10, kind: "score", color: "#ffd166" },
  { label: "Bankrut", kind: "bankrupt", color: "#1b1f33" },
  { label: "+1", value: 1, kind: "score", color: "#42c8ff" },
  { label: "Piją wszyscy", kind: "event", color: "#23b7ff" },
  { label: "Skip", kind: "skip", color: "#314774" },
  { label: "-5", value: -5, kind: "score", color: "#9b5dff" },
  { label: "+20", value: 20, kind: "score", color: "#ff9d63" },
  { label: "Pijesz ty", kind: "event", color: "#ff6ab0" },
  { label: "+10", value: 10, kind: "score", color: "#f3e66d" },
  { label: "Pije twoja drużyna", kind: "event", color: "#36e0c7" },
  { label: "-10", value: -10, kind: "score", color: "#ff4ec7" }
];

const LETTER_PATTERN = /[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]/;

const state = createInitialState();

document.addEventListener("DOMContentLoaded", () => {
  buildNavigation();
  cacheInitialState();
  renderRounds();
  populateWelcomeForm();
  bindWelcomeForm();
  bindNavigation();
  bindMenuToggle();
  bindResetButton();
  hydrateRoundScoreInputs();
  refreshTeamNames();
  renderFinalScoreboard();
  showView("welcome");
});

function createInitialState() {
  return {
    teams: { ...DEFAULT_TEAMS },
    scores: createDefaultScores(),
    game2: {
      currentQuestion: 0,
      revealedAnswers: GAME_2_QUESTIONS.map((question) => Array(question.answers.length).fill(false))
    },
    game3: {
      revealedCategories: GAME_3_CATEGORIES.map(() => false)
    },
    game5: {
      phraseIndex: 0,
      guessedLetters: [],
      missedLetters: [],
      roundValue: 0,
      statusMessage: "Zakreć kołem i zacznij zgadywać litery.",
      messageType: "",
      solved: false
    },
    debate: {
      selectedTopic: null
    },
    game6: { roundScore: 20 },
    ui: { timers: {}, wheels: {} }
  };
}

function createDefaultScores() {
  return ROUND_CONFIG.reduce((accumulator, round) => {
    accumulator[round.id] = { team1Score: 0, team2Score: 0 };
    return accumulator;
  }, {});
}

function buildNavigation() {
  const navItems = [
    { target: "welcome", label: "Start" },
    ...ROUND_CONFIG.map((round) => ({ target: round.id, label: round.navLabel })),
    { target: "final-score", label: "Wynik końcowy" }
  ];

  document.getElementById("mainNav").innerHTML = navItems.map((item, index) => `
    <button class="nav-tab ${index === 0 ? "is-active" : ""}" type="button" data-target="${item.target}">
      ${item.label}
    </button>
  `).join("");
}

function cacheInitialState() {
  const storedTeams = readLocalStorage(STORAGE_KEYS.teams, null);
  const storedScores = readLocalStorage(STORAGE_KEYS.scores, null);

  if (storedTeams?.team1Name && storedTeams?.team2Name) {
    state.teams = storedTeams;
  }

  if (storedScores && typeof storedScores === "object") {
    ROUND_CONFIG.forEach((round) => {
      state.scores[round.id] = {
        team1Score: toInteger(storedScores[round.id]?.team1Score),
        team2Score: toInteger(storedScores[round.id]?.team2Score)
      };
    });
  }
}

function renderRounds() {
  clearAllTimers();
  const roundViews = document.getElementById("roundViews");
  roundViews.innerHTML = "";
  state.ui.timers = {};
  state.ui.wheels = {};

  ROUND_CONFIG.forEach((round, index) => {
    const section = document.createElement("section");
    section.className = "view-panel";
    section.id = round.id;
    section.dataset.view = "";
    section.innerHTML = buildRoundSection(round, index);
    roundViews.appendChild(section);
    bindRoundBaseActions(section, round, index);
    setupRoundFeatures(section, round);
  });
}

function buildRoundSection(round, index) {
  const nextLabel = index === ROUND_CONFIG.length - 1 ? "Wynik końcowy →" : "Dalej →";
  const layoutClass = round.layout === "split" ? "round-layout-split" : "round-layout-compact";

  return `
    <div class="panel-header">
      <div>
        <p class="section-kicker">${round.kind === "intermission" ? "Intermisja" : "Runda"}</p>
        <h2>${round.title}</h2>
        <p class="panel-subtitle">${getRoundSubtitle(round)}</p>
      </div>
      <span class="status-pill">Wyniki ukryte do finału</span>
    </div>

    <div class="round-shell">
      <div class="${layoutClass}">
        <article class="round-body glass-card ${round.type}">
          ${getRoundBodyMarkup(round)}
        </article>
        ${createScoreCard(round, nextLabel)}
      </div>
    </div>
  `;
}

function createScoreCard(round, nextLabel) {
  const wrapper = round.layout === "split" ? "aside" : "div";
  return `
    <${wrapper} class="score-card glass-card">
      <h3>Karta punktacji</h3>
      <div class="team-badges">
        <div class="team-badge team-badge-a">
          <span>Drużyna 1</span>
          <strong class="team-name team-name-1">Drużyna 1</strong>
        </div>
        <div class="team-badge team-badge-b">
          <span>Drużyna 2</span>
          <strong class="team-name team-name-2">Drużyna 2</strong>
        </div>
      </div>

      <form class="score-form" data-score-form="${round.id}">
        <div class="score-actions two-columns">
          <label class="input-card">
            <span>Punkty drużyny 1</span>
            <input class="team1-score-input" type="number" step="1" value="0" required>
          </label>
          <label class="input-card">
            <span>Punkty drużyny 2</span>
            <input class="team2-score-input" type="number" step="1" value="0" required>
          </label>
        </div>

        <p class="score-note">
          Możesz wpisywać dodatnie i ujemne wartości. Punkty zapisuje prowadzący.
        </p>

        <div class="compact-footer">
          <button class="secondary-button large-action" type="submit">Zapisz wynik</button>
          <button class="primary-button pulse-button large-action next-round-button" type="button" data-next-round="${round.id}">
            ${nextLabel}
          </button>
        </div>
      </form>
    </${wrapper}>
  `;
}

function getRoundSubtitle(round) {
  if (round.type === "music") {
    return "Słuchaj uważnie i zgarnij punkty dla swojej drużyny!";
  }

  if (round.type === "acting") {
    return "Prowadzący wybiera drużynę, która najlepiej odegra wskazaną postać.";
  }

  const subtitles = {
    blef: "Szybki support-screen do rundy na żywo z ręcznym wpisaniem punktów.",
    quantity: "Pytania, odkrywanie odpowiedzi i stoper do licytacyjnej rywalizacji.",
    melody: "Kategorie odsłaniają tytuły i wykonawców w klimacie teleturnieju muzycznego.",
    charades: "Minimalistyczny ekran prowadzącego z timerem i zasadami rundy.",
    hangman: "Wisielec z kołem, literami i podpowiedziami w stylu teleturnieju.",
    debate: "Krótka debata z wyborem tematu, widocznym stoperem i ręczną oceną prowadzącego.",
    "famous-person": "Panel prowadzącego do szybkiego odejmowania punktów w trakcie zgadywania."
  };

  return subtitles[round.type] || "Runda wydarzenia.";
}

function getRoundBodyMarkup(round) {
  switch (round.type) {
    case "blef":
      return `
        <div class="round-intro">
          <div class="round-chip">Na żywo</div>
          <h3>Blef</h3>
          <ol class="rules-list">
            <li>Blef – przed Wami stoją 2 kieliszki. W jednym z nich jest ciepła wódka, w drugim ciepła woda.</li>
            <li>Osoba pijąca musi zwieść drużynę przeciwną.</li>
            <li>Jeżeli uda się oszukać przeciwną drużynę, jej drużyna dostaje 10 pkt, a drużyna przeciwna wypija drugi kieliszek.</li>
            <li>Jeżeli przeciwnicy poprawnie zgadną, oni dostają 10 pkt.</li>
          </ol>
        </div>
      `;
    case "music":
      return `
        <div class="music-stage">
          <div class="round-intro">
            <div class="round-chip">Muzyczna intermisja ${round.ordinal}</div>
            <h3>Kącik muzyczny</h3>
            <p class="muted-copy">Słuchaj uważnie i zgarnij punkty dla swojej drużyny!</p>
          </div>
          <div class="music-light-row">
            <span class="stage-light light-a"></span>
            <span class="stage-light light-b"></span>
            <span class="stage-light light-c"></span>
            <span class="stage-light light-d"></span>
          </div>
          <div class="equalizer">
            <span class="equalizer-bar" style="height:72px"></span>
            <span class="equalizer-bar" style="height:44px"></span>
            <span class="equalizer-bar" style="height:88px"></span>
            <span class="equalizer-bar" style="height:50px"></span>
            <span class="equalizer-bar" style="height:96px"></span>
            <span class="equalizer-bar" style="height:62px"></span>
            <span class="equalizer-bar" style="height:78px"></span>
            <span class="equalizer-bar" style="height:54px"></span>
          </div>
          <div class="music-notes">
            <span>♪</span><span>♫</span><span>♬</span><span>♩</span>
          </div>
        </div>
      `;
    case "quantity":
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="round-chip">3 pytania • 60 sekund</div>
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
            <article class="feature-card" data-timer-widget="game-2">
              <h3>Stoper rundy</h3>
              <div class="timer-display" data-timer-display>01:00</div>
              <div class="quick-actions">
                <button class="primary-button" type="button" data-timer-start>Start</button>
                <button class="ghost-button" type="button" data-timer-pause>Pauza</button>
                <button class="ghost-button" type="button" data-timer-reset>Reset</button>
              </div>
            </article>

            <article class="feature-card question-board">
              <div class="round-chip" data-game2-counter>Pytanie 1 z 3</div>
              <h3 data-game2-question>Ładowanie pytania...</h3>
              <div class="answers-grid" data-game2-answers></div>
              <div class="quick-actions">
                <button class="ghost-button" type="button" data-game2-reset>Resetuj pytanie</button>
                <button class="secondary-button" type="button" data-game2-next>Następne pytanie</button>
              </div>
            </article>
          </div>
        </div>
      `;
    case "acting":
      return `
        <div class="acting-stage">
          <div class="round-intro">
            <div class="round-chip">Scenka ${round.ordinal}</div>
            <h3>Odegraj postać</h3>
            <p class="muted-copy">Prowadzący wybiera drużynę, która najlepiej odegra wskazaną postać.</p>
          </div>
          <div class="curtain-frame">
            <div class="acting-stage-floor">
              <div class="acting-masks">
                <span>🎭</span><span>🎬</span><span>🎭</span>
              </div>
            </div>
          </div>
        </div>
      `;
    case "melody":
      return `
        <div class="stage-stack melody-stage">
          <article class="feature-card">
            <div class="round-chip">4 kategorie • ręczne punktowanie</div>
            <h3>Jaka to melodia</h3>
            <ol class="rules-list">
              <li>Każda z drużyn wybiera kategorię dla drużyny przeciwnej.</li>
              <li>Do zdobycia jest 10 pkt za podanie wykonawcy i tytułu po 3-sekundowym fragmencie piosenki.</li>
              <li>Można też zmniejszyć liczbę punktów do 5 pkt — wtedy prowadzący czyta 4 wersy piosenki.</li>
              <li>Jeżeli zespół nie odgadnie poprawnie, drużyna przeciwna ma szansę na ukradnięcie punktów.</li>
            </ol>
          </article>

          <article class="feature-card">
            <h3>Kategorie</h3>
            <div class="melody-grid" data-melody-grid></div>
          </article>
        </div>
      `;
    case "charades":
      return `
        <div class="stage-stack">
          <article class="feature-card">
            <div class="round-chip">Na żywo • 60 sekund</div>
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

          <article class="feature-card" data-timer-widget="game-4">
            <h3>Timer rundy</h3>
            <div class="timer-display" data-timer-display>01:00</div>
            <div class="quick-actions">
              <button class="primary-button" type="button" data-timer-start>Start</button>
              <button class="ghost-button" type="button" data-timer-pause>Pauza</button>
              <button class="ghost-button" type="button" data-timer-reset>Reset</button>
            </div>
          </article>
        </div>
      `;
    case "hangman":
      return `
        <div class="stage-stack">
          ${createWheelMarkup("game-5")}

          <article class="feature-card phrase-panel">
            <div class="round-chip" data-game5-counter>Hasło 1 z 3</div>
            <p class="muted-copy" data-game5-category>Kategoria</p>
            <div class="inline-pill" data-game5-round-value>Aktualna stawka: 0 pkt</div>
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

            <div class="message-box" data-game5-message>Zakręć kołem i zacznij zgadywać litery.</div>

            <div class="quick-actions">
              <button class="ghost-button" type="button" data-game5-reset-letters>Resetuj litery</button>
              <button class="secondary-button" type="button" data-game5-next-phrase>Następne hasło</button>
            </div>
          </article>
        </div>
      `;
    case "debate":
      return `
        <div class="stage-stack debate-stage">
          <article class="feature-card">
            <div class="round-chip">Pojedynek argumentów</div>
            <h3>Debata</h3>
            <ol class="rules-list">
              <li>Zespół wyznacza jednego przedstawiciela do debaty.</li>
              <li>Każdy gracz ma 60 sekund na uargumentowanie w jak najlepszy sposób otrzymanego stwierdzenia.</li>
              <li>O wygranej i liczbie punktów decyduje prowadzący.</li>
            </ol>
          </article>

          <div class="stage-grid two-columns">
            <article class="feature-card" data-timer-widget="acting-2">
              <h3>Timer debaty</h3>
              <div class="timer-display" data-timer-display>01:00</div>
              <div class="quick-actions">
                <button class="primary-button" type="button" data-timer-start>Start</button>
                <button class="ghost-button" type="button" data-timer-pause>Pauza</button>
                <button class="ghost-button" type="button" data-timer-reset>Reset</button>
              </div>
            </article>

            <article class="feature-card">
              <h3>Wybierz temat</h3>
              <div class="debate-topic-grid" data-debate-grid></div>
              <div class="message-box" data-debate-selected>
                Wybierz temat, aby pokazać pełne stwierdzenie.
              </div>
            </article>
          </div>
        </div>
      `;
    case "famous-person":
      return `
        <div class="support-stage">
          <article class="feature-card">
            <div class="round-chip">Start: 20 pkt</div>
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
              <p>Ten wynik możesz wpisać ręcznie do punktacji odpowiedniej drużyny.</p>
            </article>

            <article class="support-tile">
              <h3>Szybkie akcje</h3>
              <div class="quick-actions">
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
      return "";
  }
}

function createWheelMarkup(roundId) {
  return `
    <div class="wheel-stage">
      <article class="feature-card wheel-board" data-wheel-widget="${roundId}">
        <div class="wheel-shell">
          <div class="wheel-glow"></div>
          <div class="wheel-pointer"></div>
          <div class="wheel-rotor" data-wheel-rotor>
            <div class="wheel-face" data-wheel-face></div>
            <div class="wheel-label-layer" data-wheel-labels></div>
          </div>
          <div class="wheel-center-cap">SPIN</div>
        </div>
        <button class="primary-button pulse-button" type="button" data-wheel-spin>Zakręć kołem</button>
        <div class="wheel-legend" data-wheel-legend></div>
      </article>

      <article class="feature-card wheel-result-card">
        <div class="round-chip">Wynik losowania</div>
        <div class="wheel-result-value" data-wheel-result>Jeszcze nie zakręcono</div>
        <p class="wheel-result-note" data-wheel-note>Koło pokazuje wynik punktowy lub pole specjalne.</p>
      </article>
    </div>
  `;
}

function bindRoundBaseActions(section, round, index) {
  const form = section.querySelector(`[data-score-form="${round.id}"]`);
  const nextButton = section.querySelector(`[data-next-round="${round.id}"]`);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveRoundScore(round.id, { showSuccessToast: true });
  });

  nextButton.addEventListener("click", async () => {
    const saved = await saveRoundScore(round.id, { showSuccessToast: false });

    if (!saved) {
      return;
    }

    const nextViewId = index === ROUND_CONFIG.length - 1 ? "final-score" : ROUND_CONFIG[index + 1].id;
    showView(nextViewId);
    showToast(`Zapisano rundę: ${round.summaryLabel}.`, "success");
  });
}

function setupRoundFeatures(section, round) {
  if (round.id === "game-2") {
    setupTimerWidget(section.querySelector('[data-timer-widget="game-2"]'), "timer-game-2", DEFAULT_TIMER_SECONDS);
    bindGame2(section);
    renderGame2Question();
  }

  if (round.id === "game-3") {
    bindGame3(section);
    renderGame3();
  }

  if (round.id === "game-4") {
    setupTimerWidget(section.querySelector('[data-timer-widget="game-4"]'), "timer-game-4", DEFAULT_TIMER_SECONDS);
  }

  if (round.id === "acting-2") {
    setupTimerWidget(section.querySelector('[data-timer-widget="acting-2"]'), "timer-acting-2", DEFAULT_TIMER_SECONDS);
    bindDebate(section);
    renderDebate();
  }

  if (round.id === "game-5") {
    initializeWheel(section.querySelector('[data-wheel-widget="game-5"]'), "wheel-game-5", handleGame5WheelResult);
    bindGame5(section);
    renderGame5();
  }

  if (round.id === "game-6") {
    bindGame6(section);
    updateGame6Display();
  }
}

function populateWelcomeForm() {
  document.getElementById("team1Name").value = state.teams.team1Name === DEFAULT_TEAMS.team1Name ? "" : state.teams.team1Name;
  document.getElementById("team2Name").value = state.teams.team2Name === DEFAULT_TEAMS.team2Name ? "" : state.teams.team2Name;
}

function bindWelcomeForm() {
  document.getElementById("welcomeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const team1Name = sanitizeText(formData.get("team1Name"));
    const team2Name = sanitizeText(formData.get("team2Name"));

    if (!team1Name || !team2Name) {
      showToast("Wpisz nazwy obu drużyn.", "error");
      return;
    }

    state.teams = { team1Name, team2Name };
    saveLocalStorage(STORAGE_KEYS.teams, state.teams);
    refreshTeamNames();

    const initialized = await postToAppsScript({
      action: "initializeTeams",
      team1Name,
      team2Name,
      rounds: ROUND_CONFIG.map((round, index) => ({
        roundIndex: index + 1,
        roundId: round.id,
        roundLabel: round.summaryLabel
      }))
    });

    if (initialized) {
      showToast("Drużyny zapisane. Ruszamy z pierwszą rundą.", "success");
      showView(ROUND_CONFIG[0].id);
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
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    mainNav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open");
  });
}

function bindResetButton() {
  document.getElementById("resetSessionButton").addEventListener("click", () => {
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
    renderRounds();
    populateWelcomeForm();
    hydrateRoundScoreInputs();
    refreshTeamNames();
    renderFinalScoreboard();
    showView("welcome");
    showToast("Sesja została zresetowana lokalnie.", "success");
  });
}

function hydrateRoundScoreInputs() {
  ROUND_CONFIG.forEach((round) => {
    const section = document.getElementById(round.id);
    if (!section) {
      return;
    }

    section.querySelector(".team1-score-input").value = state.scores[round.id].team1Score;
    section.querySelector(".team2-score-input").value = state.scores[round.id].team2Score;
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

  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === viewId);
  });

  closeMobileMenu();

  if (viewId === "final-score") {
    renderFinalScoreboard();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobileMenu() {
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  document.getElementById("mainNav").classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

async function saveRoundScore(roundId, options = {}) {
  const section = document.getElementById(roundId);
  const team1Score = Number(section.querySelector(".team1-score-input").value);
  const team2Score = Number(section.querySelector(".team2-score-input").value);
  const roundIndex = getRoundIndex(roundId) + 1;
  const round = getRoundById(roundId);

  if (!Number.isInteger(team1Score) || !Number.isInteger(team2Score)) {
    showToast("Wyniki muszą być liczbami całkowitymi. Mogą być także ujemne.", "error");
    return false;
  }

  state.scores[roundId] = { team1Score, team2Score };
  saveLocalStorage(STORAGE_KEYS.scores, state.scores);

  const saved = await postToAppsScript({
    action: "saveScore",
    roundIndex,
    roundId,
    roundLabel: round.summaryLabel,
    team1Name: state.teams.team1Name,
    team2Name: state.teams.team2Name,
    team1Score,
    team2Score
  });

  if (!saved) {
    return false;
  }

  renderFinalScoreboard();

  if (options.showSuccessToast) {
    showToast(`Zapisano: ${round.summaryLabel}.`, "success");
  }

  return true;
}

async function postToAppsScript(payload) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    showToast("Adres Apps Script nie jest ustawiony. Zapis lokalny działa.", "error");
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
  const winnerRevealName = document.getElementById("winnerRevealName");
  const winnerMessage = document.getElementById("winnerMessage");

  scoreboardBody.innerHTML = "";

  let team1Total = 0;
  let team2Total = 0;

  ROUND_CONFIG.forEach((round) => {
    const scores = state.scores[round.id];
    team1Total += scores.team1Score;
    team2Total += scores.team2Score;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${round.summaryLabel}</td>
      <td>${formatSigned(scores.team1Score)}</td>
      <td>${formatSigned(scores.team2Score)}</td>
    `;
    scoreboardBody.appendChild(row);
  });

  document.getElementById("team1Total").textContent = formatSigned(team1Total);
  document.getElementById("team2Total").textContent = formatSigned(team2Total);

  winnerCard.className = "glass-card winner-card is-celebrating";

  if (team1Total > team2Total) {
    winnerCard.classList.add("is-team-1");
    winnerHeadline.textContent = "WYGRYWA...";
    winnerRevealName.textContent = state.teams.team1Name;
    winnerMessage.textContent = `${state.teams.team1Name} kończy wieczór z wynikiem ${formatSigned(team1Total)} i wyprzedza ${state.teams.team2Name}.`;
  } else if (team2Total > team1Total) {
    winnerCard.classList.add("is-team-2");
    winnerHeadline.textContent = "WYGRYWA...";
    winnerRevealName.textContent = state.teams.team2Name;
    winnerMessage.textContent = `${state.teams.team2Name} kończy wieczór z wynikiem ${formatSigned(team2Total)} i wyprzedza ${state.teams.team1Name}.`;
  } else {
    winnerCard.classList.add("is-draw");
    winnerHeadline.textContent = "REMIS!";
    winnerRevealName.textContent = "Obie drużyny";
    winnerMessage.textContent = `Obie drużyny kończą wieczór z identycznym wynikiem ${formatSigned(team1Total)}.`;
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
      resetTimer("timer-game-2");
      renderGame2Question();
    } else {
      showToast("To było ostatnie pytanie w tej rundzie.", "success");
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
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `reveal-tile ${state.game2.revealedAnswers[questionIndex][index] ? "is-revealed" : ""}`;
    tile.innerHTML = state.game2.revealedAnswers[questionIndex][index]
      ? `<span>${answer}</span>`
      : `<span class="reveal-index">${index + 1}</span>`;

    tile.addEventListener("click", () => {
      state.game2.revealedAnswers[questionIndex][index] = !state.game2.revealedAnswers[questionIndex][index];
      renderGame2Question();
    });

    answersContainer.appendChild(tile);
  });

  nextButton.textContent = questionIndex === GAME_2_QUESTIONS.length - 1 ? "To już ostatnie pytanie" : "Następne pytanie";
}

function bindGame3(section) {
  const grid = section.querySelector("[data-melody-grid]");

  grid.addEventListener("click", (event) => {
    const tile = event.target.closest("[data-melody-index]");
    if (!tile) {
      return;
    }

    const tileIndex = Number(tile.dataset.melodyIndex);
    if (state.game3.revealedCategories[tileIndex]) {
      return;
    }

    state.game3.revealedCategories[tileIndex] = true;
    renderGame3();
  });
}

function renderGame3() {
  const section = document.getElementById("game-3");
  if (!section) {
    return;
  }

  section.querySelector("[data-melody-grid]").innerHTML = GAME_3_CATEGORIES.map((category, index) => {
    const isRevealed = state.game3.revealedCategories[index];
    return `
      <button
        class="melody-tile ${isRevealed ? "is-revealed" : ""}"
        type="button"
        data-melody-index="${index}"
      >
        <span class="melody-tile-inner">
          <span class="melody-face melody-front">
            <span class="round-chip">Kategoria</span>
            <strong>${category.label}</strong>
          </span>
          <span class="melody-face melody-back">
            <span class="melody-answer-line">${category.artist}</span>
            <span class="melody-answer-line">${category.title}</span>
          </span>
        </span>
      </button>
    `;
  }).join("");
}

function bindDebate(section) {
  section.querySelector("[data-debate-grid]").addEventListener("click", (event) => {
    const topicButton = event.target.closest("[data-debate-index]");
    if (!topicButton) {
      return;
    }

    state.debate.selectedTopic = Number(topicButton.dataset.debateIndex);
    renderDebate();
  });
}

function renderDebate() {
  const section = document.getElementById("acting-2");
  if (!section) {
    return;
  }

  section.querySelector("[data-debate-grid]").innerHTML = DEBATE_TOPICS.map((topic, index) => `
    <button
      class="debate-topic-card ${state.debate.selectedTopic === index ? "is-selected" : ""}"
      type="button"
      data-debate-index="${index}"
    >
      <span class="round-chip">Temat ${index + 1}</span>
      <strong>${state.debate.selectedTopic === index ? topic : `Temat ${index + 1}`}</strong>
    </button>
  `).join("");

  section.querySelector("[data-debate-selected]").textContent = state.debate.selectedTopic === null
    ? "Wybierz temat, aby pokazać pełne stwierdzenie."
    : `Wybrano: ${DEBATE_TOPICS[state.debate.selectedTopic]}`;
}

function setupTimerWidget(widget, timerKey, durationSeconds) {
  if (!widget) {
    return;
  }

  state.ui.timers[timerKey] = {
    duration: durationSeconds,
    remaining: durationSeconds,
    intervalId: null,
    display: widget.querySelector("[data-timer-display]")
  };

  widget.querySelector("[data-timer-start]").addEventListener("click", () => startTimer(timerKey));
  widget.querySelector("[data-timer-pause]").addEventListener("click", () => pauseTimer(timerKey));
  widget.querySelector("[data-timer-reset]").addEventListener("click", () => resetTimer(timerKey));
  updateTimerDisplay(timerKey);
}

function startTimer(timerKey) {
  const timer = state.ui.timers[timerKey];
  if (!timer || timer.intervalId) {
    return;
  }

  timer.intervalId = window.setInterval(() => {
    timer.remaining -= 1;
    updateTimerDisplay(timerKey);

    if (timer.remaining <= 0) {
      timer.remaining = 0;
      pauseTimer(timerKey);
      updateTimerDisplay(timerKey);
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
  updateTimerDisplay(timerKey);
}

function updateTimerDisplay(timerKey) {
  const timer = state.ui.timers[timerKey];
  if (!timer) {
    return;
  }

  const minutes = String(Math.floor(timer.remaining / 60)).padStart(2, "0");
  const seconds = String(timer.remaining % 60).padStart(2, "0");
  timer.display.textContent = `${minutes}:${seconds}`;
}

function clearAllTimers() {
  Object.values(state.ui.timers).forEach((timer) => {
    if (timer?.intervalId) {
      window.clearInterval(timer.intervalId);
    }
  });
}

function initializeWheel(widget, wheelKey, onResult) {
  if (!widget) {
    return;
  }

  const rotor = widget.querySelector("[data-wheel-rotor]");
  const face = widget.querySelector("[data-wheel-face]");
  const labelsLayer = widget.querySelector("[data-wheel-labels]");
  const legend = widget.querySelector("[data-wheel-legend]");
  const resultCard = widget.parentElement.querySelector(".wheel-result-card");
  const resultValue = resultCard.querySelector("[data-wheel-result]");
  const resultNote = resultCard.querySelector("[data-wheel-note]");
  const spinButton = widget.querySelector("[data-wheel-spin]");

  face.style.background = buildWheelGradient();
  labelsLayer.innerHTML = buildWheelLabelsMarkup();
  legend.innerHTML = WHEEL_SEGMENTS.map((segment) => `
    <span class="legend-chip">
      <span class="legend-chip-swatch" style="background:${segment.color}"></span>
      ${segment.label}
    </span>
  `).join("");

  state.ui.wheels[wheelKey] = {
    rotor,
    resultValue,
    resultNote,
    spinButton,
    rotation: 0,
    spinning: false
  };

  spinButton.addEventListener("click", () => spinWheel(wheelKey, onResult));
}

function buildWheelGradient() {
  const angle = 360 / WHEEL_SEGMENTS.length;
  return `conic-gradient(${WHEEL_SEGMENTS.map((segment, index) => {
    const start = index * angle;
    const end = (index + 1) * angle;
    return `${segment.color} ${start}deg ${end}deg`;
  }).join(",")})`;
}

function buildWheelLabelsMarkup() {
  const angle = 360 / WHEEL_SEGMENTS.length;
  const radius = 35;

  return WHEEL_SEGMENTS.map((segment, index) => {
    const midAngle = (index * angle) + (angle / 2) - 90;
    const radians = (midAngle * Math.PI) / 180;
    const x = 50 + (radius * Math.cos(radians));
    const y = 50 + (radius * Math.sin(radians));
    return `
      <div class="wheel-label" style="left:${x}%;top:${y}%;transform:translate(-50%, -50%) rotate(${midAngle + 90}deg);">
        <span style="transform:rotate(${-midAngle - 90}deg);background:rgba(0,0,0,0.16);">${segment.label}</span>
      </div>
    `;
  }).join("");
}

function spinWheel(wheelKey, onResult) {
  const wheel = state.ui.wheels[wheelKey];
  if (!wheel || wheel.spinning) {
    return;
  }

  const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  const segment = WHEEL_SEGMENTS[segmentIndex];
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;
  const targetAngle = 360 - ((segmentIndex * segmentAngle) + (segmentAngle / 2));
  const normalizedCurrent = ((wheel.rotation % 360) + 360) % 360;
  const delta = ((targetAngle - normalizedCurrent) + 360) % 360;
  const overshoot = wheel.rotation + (8 * 360) + delta + 10;
  const finalRotation = overshoot - 10;

  wheel.spinning = true;
  wheel.spinButton.disabled = true;
  wheel.resultValue.textContent = "Kręcimy...";
  wheel.resultNote.textContent = "Koło wiruje i zaraz wskaże wynik.";
  wheel.rotor.style.transition = "transform 6.3s cubic-bezier(0.08, 0.89, 0.18, 1)";
  wheel.rotor.style.transform = `rotate(${overshoot}deg)`;

  window.setTimeout(() => {
    wheel.rotor.style.transition = "transform 420ms ease-out";
    wheel.rotor.style.transform = `rotate(${finalRotation}deg)`;
  }, 6300);

  window.setTimeout(() => {
    wheel.rotation = finalRotation;
    wheel.spinning = false;
    wheel.spinButton.disabled = false;
    onResult(segment, wheel);
  }, 6740);
}

function handleGame3WheelResult(segment, wheel) {
  wheel.resultValue.textContent = segment.label;
  wheel.resultNote.textContent = segment.kind === "score"
    ? `Koło wskazało ${formatSigned(segment.value)} pkt.`
    : `Wypadło pole specjalne: ${segment.label}.`;
}

function bindGame5(section) {
  section.querySelector("[data-game5-letter-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    processGame5Letter(section);
  });

  section.querySelector("[data-game5-guess-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    processGame5Phrase(section);
  });

  section.querySelector("[data-game5-reset-letters]").addEventListener("click", () => {
    const currentPhraseIndex = state.game5.phraseIndex;
    state.game5 = createInitialState().game5;
    state.game5.phraseIndex = currentPhraseIndex;
    renderGame5();
    resetWheelOutput("wheel-game-5");
  });

  section.querySelector("[data-game5-next-phrase]").addEventListener("click", () => {
    if (state.game5.phraseIndex >= GAME_5_PHRASES.length - 1) {
      showToast("To było ostatnie hasło w tej rundzie.", "success");
      return;
    }

    state.game5 = createInitialState().game5;
    state.game5.phraseIndex += 1;
    renderGame5();
    resetWheelOutput("wheel-game-5");
  });
}

function handleGame5WheelResult(segment, wheel) {
  if (segment.kind === "score") {
    state.game5.roundValue = segment.value;
    state.game5.statusMessage = `Aktualna stawka tej próby to ${formatSigned(segment.value)} pkt.`;
    state.game5.messageType = "";
    wheel.resultNote.textContent = "Jeśli hasło zostanie odgadnięte, wpisz tę wartość do punktacji.";
  } else if (segment.kind === "skip") {
    state.game5.statusMessage = "Skip. Ta próba przepada i możesz przejść dalej.";
    state.game5.messageType = "";
    wheel.resultNote.textContent = "Pole skip pomija próbę bez przyznawania punktów.";
  } else if (segment.kind === "bankrupt") {
    state.game5.roundValue = 0;
    state.game5.statusMessage = "Bankrut. Stawka rundy wraca do 0 pkt.";
    state.game5.messageType = "is-error";
    wheel.resultNote.textContent = "Bankrut zeruje stawkę aktualnej próby.";
  } else {
    state.game5.statusMessage = `Pole specjalne: ${segment.label}. Efekt rozlicz ręcznie w punktacji.`;
    state.game5.messageType = "";
    wheel.resultNote.textContent = "Pole specjalne nie ustawia punktów automatycznie.";
  }

  wheel.resultValue.textContent = segment.label;
  renderGame5();
}

function renderGame5() {
  const section = document.getElementById("game-5");
  if (!section) {
    return;
  }

  const phraseData = GAME_5_PHRASES[state.game5.phraseIndex];
  section.querySelector("[data-game5-counter]").textContent = `Hasło ${state.game5.phraseIndex + 1} z ${GAME_5_PHRASES.length}`;
  section.querySelector("[data-game5-category]").textContent = `Kategoria: ${phraseData.category}`;
  section.querySelector("[data-game5-round-value]").textContent = `Aktualna stawka: ${formatSigned(state.game5.roundValue)} pkt`;
  section.querySelector("[data-game5-message]").textContent = state.game5.statusMessage;
  section.querySelector("[data-game5-message]").className = `message-box ${state.game5.messageType}`.trim();
  section.querySelector("[data-game5-next-phrase]").textContent = state.game5.phraseIndex === GAME_5_PHRASES.length - 1
    ? "To już ostatnie hasło"
    : "Następne hasło";

  renderMaskedPhrase(section.querySelector("[data-game5-phrase]"), phraseData.phrase);
  renderLetters(section.querySelector("[data-game5-hit-letters]"), state.game5.guessedLetters, false);
  renderLetters(section.querySelector("[data-game5-missed-letters]"), state.game5.missedLetters, true);
}

function processGame5Letter(section) {
  const input = section.querySelector("[data-game5-letter-input]");
  const value = sanitizeText(input.value);

  if (!value || value.length !== 1 || !LETTER_PATTERN.test(value)) {
    showToast("Wpisz jedną poprawną literę.", "error");
    return;
  }

  const normalizedValue = normalizeLetter(value);
  const phrase = GAME_5_PHRASES[state.game5.phraseIndex].phrase;
  const normalizedPhraseLetters = Array.from(phrase).map((letter) => normalizeLetter(letter));

  if (
    state.game5.guessedLetters.some((letter) => normalizeLetter(letter) === normalizedValue) ||
    state.game5.missedLetters.some((letter) => normalizeLetter(letter) === normalizedValue)
  ) {
    showToast("Ta litera była już użyta.", "error");
    input.value = "";
    return;
  }

  if (normalizedPhraseLetters.includes(normalizedValue)) {
    state.game5.guessedLetters.push(value.toUpperCase());
    state.game5.statusMessage = `Litera ${value.toUpperCase()} występuje w haśle.`;
    state.game5.messageType = "is-success";
  } else {
    state.game5.missedLetters.push(value.toUpperCase());
    state.game5.statusMessage = `Litera ${value.toUpperCase()} nie występuje w haśle.`;
    state.game5.messageType = "is-error";
  }

  input.value = "";
  renderGame5();
}

function processGame5Phrase(section) {
  const input = section.querySelector("[data-game5-guess-input]");
  const guess = sanitizeText(input.value);
  const phrase = GAME_5_PHRASES[state.game5.phraseIndex].phrase;

  if (!guess) {
    showToast("Wpisz całe hasło.", "error");
    return;
  }

  if (normalizePhrase(guess) === normalizePhrase(phrase)) {
    state.game5.solved = true;
    state.game5.statusMessage = `Poprawnie. Odkryto hasło. Aktualna stawka to ${formatSigned(state.game5.roundValue)} pkt.`;
    state.game5.messageType = "is-success";
  } else {
    state.game5.statusMessage = "To nie jest poprawne hasło.";
    state.game5.messageType = "is-error";
  }

  input.value = "";
  renderGame5();
}

function renderMaskedPhrase(container, phrase) {
  const guessedSet = new Set(state.game5.guessedLetters.map((letter) => normalizeLetter(letter)));
  const revealAll = state.game5.solved;

  container.innerHTML = Array.from(phrase).map((character) => {
    if (character === " ") {
      return '<span class="phrase-separator">/</span>';
    }

    if (!LETTER_PATTERN.test(character)) {
      return `<span class="phrase-cell">${character}</span>`;
    }

    const normalizedCharacter = normalizeLetter(character);
    const visible = revealAll || guessedSet.has(normalizedCharacter) ? character.toUpperCase() : "_";
    return `<span class="phrase-cell">${visible}</span>`;
  }).join("");
}

function renderLetters(container, letters, missed) {
  container.innerHTML = letters.length
    ? letters.map((letter) => `<span class="letter-chip ${missed ? "missed" : ""}">${letter}</span>`).join("")
    : `<span class="letter-chip ${missed ? "missed" : ""}">-</span>`;
}

function resetWheelOutput(wheelKey) {
  const wheel = state.ui.wheels[wheelKey];
  if (!wheel) {
    return;
  }

  wheel.resultValue.textContent = "Jeszcze nie zakręcono";
  wheel.resultNote.textContent = "Koło pokazuje wynik punktowy lub pole specjalne.";
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
    const adjustment = Number(section.querySelector("[data-game6-adjust-input]").value);

    if (!Number.isInteger(adjustment)) {
      showToast("Korekta musi być liczbą całkowitą.", "error");
      return;
    }

    state.game6.roundScore += adjustment;
    section.querySelector("[data-game6-adjust-input]").value = "0";
    updateGame6Display();
  });
}

function updateGame6Display() {
  const display = document.querySelector("[data-game6-score]");
  if (display) {
    display.textContent = formatSigned(state.game6.roundScore);
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.getElementById("toastStack").appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function getRoundById(roundId) {
  return ROUND_CONFIG.find((round) => round.id === roundId);
}

function getRoundIndex(roundId) {
  return ROUND_CONFIG.findIndex((round) => round.id === roundId);
}

function formatSigned(value) {
  return value > 0 ? `+${value}` : String(value);
}

function sanitizeText(value) {
  return String(value || "").trim();
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

function toInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : 0;
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
