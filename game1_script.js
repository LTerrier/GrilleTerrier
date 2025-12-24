// GAME ACCESS CHECK
let players = JSON.parse(localStorage.getItem("players")) || [];

if (!Array.isArray(players) || players.length === 0) {
  window.location.href = "character.html";
  throw new Error("Game blocked");
}

// GRID
const grid = document.getElementById("grid");

const playableTiles = [
  ...Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0 })),
  ...Array.from({ length: 7 }, (_, i) => ({ x: i + 1, y: 1 })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: i + 2, y: 2 })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: i + 2, y: 3, exit: true }))
];

const TILE_SIZE = 60;

playableTiles.forEach(tile => {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.style.left = tile.x * TILE_SIZE + "px";
  cell.style.top = tile.y * TILE_SIZE + "px";
  if (tile.exit) cell.classList.add("exit");
  cell.dataset.x = tile.x;
  cell.dataset.y = tile.y;
  grid.appendChild(cell);
});

// UTILS
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function isPlayable(x, y) {
  return playableTiles.some(t => t.x === x && t.y === y);
}

// CHALLENGES
let challengeDone = false;
let difficultyLevel = 1;
let currentChallenge = null;

const classChallenges = {
  mage: [
    { difficulty: 1, question: "Je suis invisible mais je brûle. Qui suis-je ?", answers: ["feu"], success: 1, failure: 1 },
    { difficulty: 2, question: "Plus je suis partagé, plus je grandis.", answers: ["le savoir", "la connaissance"], success: 2, failure: 2 },
    { difficulty: 3, question: "Villes sans maisons, rivières sans eau ?", answers: ["une carte"], success: 2, failure: 2 }
  ],
  guerrier: [
    { difficulty: 1, question: "Qu’est-ce qui tombe toujours ?", answers: ["la nuit"], success: 1, failure: 1 },
    { difficulty: 2, question: "Toujours devant toi ?", answers: ["le futur"], success: 2, failure: 2 },
    { difficulty: 3, question: "Pont fragile la nuit ?", answers: ["un par un"], success: 2, failure: 2 }
  ],
  voleur: [
    { difficulty: 1, question: "Plus tu prends, plus tu laisses ?", answers: ["les pas"], success: 1, failure: 1 },
    { difficulty: 2, question: "Je parle sans bouche ?", answers: ["echo"], success: 2, failure: 0 },
    { difficulty: 3, question: "Je vole sans ailes ?", answers: ["nuage"], success: 2, failure: 2 }
  ],
  druide: [
    { difficulty: 1, question: "Je disparais sans trace ?", answers: ["fumee"], success: 1, failure: 1 },
    { difficulty: 2, question: "Appartient à la forêt ?", answers: ["ombre"], success: 2, failure: 2 },
    { difficulty: 3, question: "Pris avant d’être donné ?", answers: ["souffle"], success: 2, failure: 2 }
  ]
};

function startChallenge() {
  challengeDone = false;

  const player = players[currentPlayerIndex];
  const pool = classChallenges[player.classe].filter(c => c.difficulty === difficultyLevel);
  currentChallenge = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById("challengeZone").textContent = currentChallenge.question;
  document.getElementById("difficultyZone").textContent = `Difficulté : ${difficultyLevel}`;
  document.getElementById("answerInput").value = "";
}

// ANSWER CHECK
document.getElementById("answerBtn").addEventListener("click", () => {
  if (challengeDone) return;
  challengeDone = true;

  const input = normalize(document.getElementById("answerInput").value);
  const valid = currentChallenge.answers.some(a => normalize(a) === input);

  if (valid) {
    actionsRemaining += currentChallenge.success;
    finishChallenge("Bonne réponse !");
  } else {
    actionsRemaining = Math.max(0, actionsRemaining - currentChallenge.failure);
    finishChallenge("Mauvaise réponse");
  }
});

function finishChallenge(text) {
  document.getElementById("challengeZone").textContent = text;
  document.getElementById("solutionZone").textContent =
    "Bonne réponse : " + currentChallenge.answers[0];
  renderPlayers();
}

// PLAYERS INIT
players = players.map(p => ({
  ...p,
  pseudo: p.pseudo.toUpperCase(),
  position: { x: 0, y: 0 }
}));

let currentPlayerIndex = 0;
let initialActions = 0;
let actionsRemaining = 0;

// ===============================
// STYLES
// ===============================
const classStyles = {
  mage: { color: "purple", symbol: "✦" },
  guerrier: { color: "red", symbol: "⚔" },
  voleur: { color: "green", symbol: "☠" },
  druide: { color: "blue", symbol: "✎" }
};


// RENDER
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

  const p = players[currentPlayerIndex];
  document.getElementById("turnInfo").textContent =
    `Tour de ${p.pseudo} (${p.classe}) — ${actionsRemaining}/${initialActions} actions`;

  document.getElementById("playerRow").innerHTML = players
    .map((pl, i) => `<span style="margin-right:10px;font-weight:${i === currentPlayerIndex ? "bold" : "normal"}">${pl.pseudo}</span>`)
    .join("");
}

// TURN
function startTurn() {
  initialActions = Math.floor(Math.random() * 6) + 1;
  actionsRemaining = initialActions;
  difficultyLevel = Math.floor(Math.random() * 3) + 1;
  renderPlayers();
  startChallenge();
}

document.getElementById("endTurnBtn").addEventListener("click", () => {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  startTurn();
});

// MOVE
function movePlayer(direction) {
  if (actionsRemaining <= 0) return;

  const moves = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  };

  const p = players[currentPlayerIndex];
  const nx = p.position.x + moves[direction][0];
  const ny = p.position.y + moves[direction][1];

  if (!isPlayable(nx, ny)) return;

  p.position = { x: nx, y: ny };
  actionsRemaining--;
  renderPlayers();
}

// KEYBOARD
document.addEventListener("keydown", e => {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };
  if (map[e.key]) movePlayer(map[e.key]);
});

// CONTROLS BTN
document.querySelectorAll("#controls button").forEach(btn => {
  btn.addEventListener("click", () => {
    movePlayer(btn.dataset.dir);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("#controls button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      console.log("CLICK", btn.dataset.dir); // DEBUG
      movePlayer(btn.dataset.dir);
    });
  });
});


// INIT
startTurn();

