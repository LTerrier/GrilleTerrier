// === GAME ACCESS CHECK ===
let players = JSON.parse(localStorage.getItem("players")) || [];

if (players.length === 0) {
  window.location.href = "character.html";
  throw new Error("Game blocked");
}


localStorage.removeItem("gameLocked");

// === GRID ===
const grid = document.getElementById("grid");

const playableTiles = [
  // Ligne 1 (10)
  ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0 })),
  // Ligne 2 (7)
  ...Array.from({ length: 7 }, (_, i) => ({ x: i + 1, y: 1 })),
  // Ligne 3 (5)
  ...Array.from({ length: 5 }, (_, i) => ({ x: i + 2, y: 2 })),
  // Ligne 4 (5) → sortie
  ...Array.from({ length: 5 }, (_, i) => ({ x: i + 2, y: 3, exit: true }))
];
const TILE_SIZE = 60; cell.style.left = tile.x * TILE_SIZE + "px"; cell.style.top = tile.y * TILE_SIZE + "px";

playableTiles.forEach(tile => {
  const cell = document.createElement("div");
  cell.classList.add("cell");

  cell.style.left = tile.x * TILE_SIZE + "px";
  cell.style.top = tile.y * TILE_SIZE + "px";

  if (tile.exit) {
    cell.classList.add("exit");
  }

  cell.dataset.x = tile.x;
  cell.dataset.y = tile.y;

  grid.appendChild(cell);
});

// === CHALLENGES =====
let challengeDone = false;
let difficultyLevel = 1;

const classChallenges = {
  mage: [
    { difficulty: 1, question: "Récite le nom d’un sort célèbre.", success: "+1 action", failure: "Aucune action ajoutée" },
    { difficulty: 2, question: "Compte de 10 à 1 sans erreur.", success: "+2 actions", failure: "Aucune action ajoutée" },
    { difficulty: 3, question: "Cite 3 créatures magiques.", success: "+2 actions", failure: "Aucune action ajoutée" }
  ],
  guerrier: [
    { difficulty: 1, question: "Fais 5 squats.", success: "+1 action", failure: "Aucune action ajoutée" },
    { difficulty: 2, question: "Fais 10 pompes.", success: "+2 actions", failure: "Aucune action ajoutée" },
    { difficulty: 3, question: "Tiens la planche 20s.", success: "+2 actions", failure: "Aucune action ajoutée" }
  ],
  voleur: [
    { difficulty: 1, question: "Tiens-toi sur une jambe 10s.", success: "+1 action", failure: "Aucune action ajoutée" },
    { difficulty: 2, question: "Avance en silence.", success: "+2 actions", failure: "Aucune action ajoutée" },
    { difficulty: 3, question: "Accroupi 20s sans bouger.", success: "+2 actions", failure: "Aucune action ajoutée" }
  ],
  druide: [
    { difficulty: 1, question: "Respire profondément 3 fois.", success: "+1 action", failure: "Aucune action ajoutée" },
    { difficulty: 2, question: "Reste immobile 15s.", success: "+2 actions", failure: "Aucune action ajoutée" },
    { difficulty: 3, question: "Cite 5 plantes.", success: "+2 actions", failure: "Aucune action ajoutée" }
  ]
};

function startChallenge() {
  challengeDone = false;

  const player = players[currentPlayerIndex];
  const list = classChallenges[player.classe];

  const pool = list.filter(c => c.difficulty === difficultyLevel);
  const challenge = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById("challengeZone").textContent = challenge.question;
  document.getElementById("difficultyZone").textContent =
    `Difficulté : ${difficultyLevel}`;

  const successBtn = document.getElementById("successBtn");
  const failureBtn = document.getElementById("failureBtn");

  successBtn.disabled = false;
  failureBtn.disabled = false;

  successBtn.onclick = () => {
    if (challengeDone) return;
    challengeDone = true;
    actionsRemaining += challenge.success.includes("+2") ? 2 : 1;
    finishChallenge(challenge.success);
  };

  failureBtn.onclick = () => {
    if (challengeDone) return;
    challengeDone = true;
    actionsRemaining -= challenge.failure.includes("-2") ? 2 : 1;
    if (actionsRemaining < 0) actionsRemaining = 0;
    finishChallenge(challenge.failure);
  };
}

function finishChallenge(text) {
  document.getElementById("challengeZone").textContent = text;
  document.getElementById("successBtn").disabled = true;
  document.getElementById("failureBtn").disabled = true;
  renderPlayers();
}


// === PLAYERS ====
players = players.map(p => ({
  ...p,
  pseudo: p.pseudo.toUpperCase(),
  position: { x: 0, y: 0 }
}));

let currentPlayerIndex = 0;


// === ACTIONS ====
function getRandomActions() {
  return Math.floor(Math.random() * 6) + 1;
}
function clamp(v) {
  return Math.max(0, Math.min(v, 6));
}

let initialActions = 0;
let actionsRemaining = 0;


// === STYLES =====
const classStyles = {
  mage: { color: "purple", symbol: "✦" },
  guerrier: { color: "red", symbol: "⚔" },
  voleur: { color: "green", symbol: "☠" },
  druide: { color: "blue", symbol: "✎" }
};

// === Fonctions afficher pseudo ===
function renderPlayerRow() {
  const row = document.getElementById("playerRow");

  // Efface le contenu précédent
  row.innerHTML = "";

  // Ajoute les pseudos
  row.innerHTML = players.map((p, index) => {
    const active = index === currentPlayerIndex;
    return `
      <span style="
        margin-right:12px;
        font-weight:${active ? "bold" : "normal"};
        text-decoration:${active ? "underline" : "none"};
      ">
        ${p.pseudo}
      </span>
    `;
  }).join("");
}

// === RENDER =====
function renderPlayers() {
  document.querySelectorAll(".cell").forEach(c => (c.textContent = ""));

  players.forEach(p => {
    const cell = document.querySelector(
      `.cell[data-x='${p.position.x}'][data-y='${p.position.y}']`
    );
    if (cell) {
      cell.textContent = classStyles[p.classe].symbol;
      cell.style.color = classStyles[p.classe].color;
    }
  });

  const info = document.getElementById("turnInfo");
  const p = players[currentPlayerIndex];
  info.textContent =
    `Tour de ${p.pseudo} - ${p.classe}— ${actionsRemaining}/${initialActions} actions`;

  // 👇 APPEL OBLIGATOIRE
  renderPlayerRow();
}

// === TURN ====
function startTurn() {
  initialActions = clamp(getRandomActions());
  actionsRemaining = initialActions;

  difficultyLevel = Math.floor(Math.random() * 3) + 1;

  renderPlayers();
  startChallenge();
}

// === MOVE ====
document.addEventListener("keydown", e => {
  if (actionsRemaining <= 0) return;

  const p = players[currentPlayerIndex];
  let { x, y } = p.position;

  if (e.key === "ArrowUp" && y > 0) y--;
  else if (e.key === "ArrowDown" && y < 29) y++;
  else if (e.key === "ArrowLeft" && x > 0) x--;
  else if (e.key === "ArrowRight" && x < 29) x++;
  else return;

  p.position = { x, y };
  actionsRemaining--;
  renderPlayers();
});

// === END TURN ===
document.getElementById("endTurnBtn").addEventListener("click", () => {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  startTurn();
});

// === INIT ===
startTurn();


