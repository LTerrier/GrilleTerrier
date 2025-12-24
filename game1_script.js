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

// CHALLENGES
let challengeDone = false;
let difficultyLevel = 1;
let currentChallenge = null;

const classChallenges = {
  mage: [
    {
      difficulty: 1,
      question: "Je suis invisible mais je peux te brûler. Qui suis-je ?",
      answers: ["feu", "le feu"],
      success: "+1 action",
      failure: "-1 action"
    },
    {
      difficulty: 2,
      question: "Plus je suis partagé, plus je grandis. Que suis-je ?",
      answers: ["le savoir", "la connaissance"],
      success: "+2 actions",
      failure: "-2 actions"
    },
    {
      difficulty: 3,
      question: "J’ai des villes mais pas de maisons, des rivières sans eau et des routes sans voyageurs. Que suis-je ?",
      answers: ["une carte", "la carte"],
      success: "+2 actions",
      failure: "-2 actions"
    }
  ],

  guerrier: [
    {
      difficulty: 1,
      question: "Qu’est-ce qui tombe toujours mais ne se casse jamais ?",
      answers: ["la nuit"],
      success: "+1 action",
      failure: "-1 action"
    },
    {
      difficulty: 2,
      question: "Je suis toujours devant toi mais tu ne peux jamais m’atteindre. Qui suis-je ?",
      answers: ["le futur", "avenir"],
      success: "+2 actions",
      failure: "-2 actions"
    },
    {
      difficulty: 3,
      question: "Un soldat traverse un pont fragile la nuit avec une torche. Comment fait-il ?",
      answers: ["un par un", "ils traversent un par un"],
      success: "+2 actions",
      failure: "-2 actions"
    }
  ],

  voleur: [
    {
      difficulty: 1,
      question: "Plus tu en prends, plus tu en laisses derrière toi. Qu’est-ce ?",
      answers: ["les pas", "empreintes"],
      success: "+1 action",
      failure: "-1 action"
    },
    {
      difficulty: 2,
      question: "Je parle sans bouche et j’entends sans oreilles. Qui suis-je ?",
      answers: ["echo", "l'echo"],
      success: "+2 actions",
      failure: "aucune action"
    },
    {
      difficulty: 3,
      question: "Je peux voler sans ailes et pleurer sans yeux. Qui suis-je ?",
      answers: ["nuage", "un nuage"],
      success: "+2 actions",
      failure: "-2 actions"
    }
  ],

  druide: [
    {
      difficulty: 1,
      question: "Je grandis sans racines et disparais sans trace. Qui suis-je ?",
      answers: ["fumee", "la fumee"],
      success: "+1 action",
      failure: "-1 action"
    },
    {
      difficulty: 2,
      question: "Qu’est-ce qui appartient à la forêt mais que l’on emporte toujours ?",
      answers: ["ombre", "l'ombre"],
      success: "+2 actions",
      failure: "-2 actions"
    },
    {
      difficulty: 3,
      question: "Je suis pris avant d’être donné et disparais si on me garde trop longtemps. Que suis-je ?",
      answers: ["souffle", "le souffle"],
      success: "+2 actions",
      failure: "-2 actions"
    }
  ]
};

// UTILS
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// START CHALLENGE
function startChallenge() {
  challengeDone = false;

  const player = players[currentPlayerIndex];
  const pool = classChallenges[player.classe]
    .filter(c => c.difficulty === difficultyLevel);

  currentChallenge = pool[Math.floor(Math.random() * pool.length)];

  document.getElementById("challengeZone").textContent = currentChallenge.question;
  document.getElementById("difficultyZone").textContent =
    `Difficulté : ${difficultyLevel}`;

  document.getElementById("answerInput").value = "";
  document.getElementById("solutionZone").textContent = "";
}


// CHECK ANSWER
document.getElementById("answerBtn").addEventListener("click", () => {
  if (challengeDone) return;
  challengeDone = true;

  const input = normalize(document.getElementById("answerInput").value);
  const valid = currentChallenge.answers.some(a => normalize(a) === input);

  if (valid) {
    actionsRemaining += currentChallenge.success.includes("+2") ? 2 : 1;
    finishChallenge(currentChallenge.success);
  } else {
    actionsRemaining -= currentChallenge.failure.includes("-2") ? 2 : 0;
    if (actionsRemaining < 0) actionsRemaining = 0;
    finishChallenge(currentChallenge.failure);
  }
});

function finishChallenge(text) {
  document.getElementById("challengeZone").textContent = text;

  // ➜ Afficher la réponse correcte
  document.getElementById("solutionZone").textContent =
    "Le bonne réponse est : " + currentChallenge.answers[0];

  renderPlayers();
}


// === PLAYERS INIT ===
players = players.map(p => ({
  ...p,
  pseudo: p.pseudo.toUpperCase(),
  position: { x: 0, y: 0 }
}));

let currentPlayerIndex = 0;
let initialActions = 0;
let actionsRemaining = 0;

// ACTIONS
function getRandomActions() {
  return Math.floor(Math.random() * 6) + 1;
}
function clamp(v) {
  return Math.max(0, Math.min(v, 6));
}

// STYLES
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

  renderPlayerRow();
}

function renderPlayerRow() {
  document.getElementById("playerRow").innerHTML = players
    .map((p, i) =>
      `<span style="margin-right:10px;font-weight:${i === currentPlayerIndex ? "bold" : "normal"}">${p.pseudo}</span>`
    ).join("");
}

// TURN
function startTurn() {
  initialActions = clamp(getRandomActions());
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
document.addEventListener("keydown", e => {
  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
  };

  if (!keyMap[e.key]) return;
  movePlayer(keyMap[e.key]);
});

function movePlayer(direction) {
  if (actionsRemaining <= 0) return;

  const p = players[currentPlayerIndex];

  const moves = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  };

  if (!moves[direction]) return;

  let newX = p.position.x + moves[direction][0];
  let newY = p.position.y + moves[direction][1];

  // Vérifier si la case existe dans playableTiles
  const tileExists = playableTiles.some(t => t.x === newX && t.y === newY);

  if (!tileExists) {
    // ➜ Si on va à droite et qu'on sort de la ligne, on descend automatiquement
    if (direction === "right") {
      const belowTile = playableTiles.find(t => t.x === p.position.x && t.y === p.position.y + 1);
      if (belowTile) {
        newX = p.position.x;
        newY = p.position.y + 1;
      } else {
        return; // impossible de descendre
      }
    } else {
      return; // mouvement impossible
    }
  }

  p.position.x = newX;
  p.position.y = newY;

  actionsRemaining--;
  renderPlayers();
}


document.querySelectorAll("#controls button").forEach(btn => {
  btn.addEventListener("click", () => {
    movePlayer(btn.dataset.dir);
  });
});

// INIT
startTurn();

