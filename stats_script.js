// Render player pseudo
const tempPlayer = JSON.parse(localStorage.getItem("tempPlayer"));

if (!tempPlayer) {
  window.location.href = "character.html";
}

// Welcome
document.getElementById("welcome").textContent =
  `Bienvenue ${tempPlayer.pseudo} ! Lance les dés pour tes statistiques.`;

// RollD20 - min 1 - max 20
function rollD20() {
  return Math.floor(Math.random() * 20) + 1;
}

let stats = null;

// Rolldice
document.getElementById("rollBtn").addEventListener("click", () => {
  stats = {
    force: rollD20(),
    vitesse: rollD20(),
    intelligence: rollD20(),
    vitalite: rollD20()
  };

  document.getElementById("force").textContent = stats.force;
  document.getElementById("vitesse").textContent = stats.vitesse;
  document.getElementById("intelligence").textContent = stats.intelligence;
  document.getElementById("vitalite").textContent = stats.vitalite;
  // document.getElementById("stats").textContent = stats.stats;

  document.getElementById("statsZone").style.display = "block";
});

// ===== SAUVEGARDE DÉFINITIVE =====
document.getElementById("saveBtn").addEventListener("click", () => {
  if (!stats) return;

  const players = JSON.parse(localStorage.getItem("players")) || [];

  const player = {
    pseudo: tempPlayer.pseudo,
    classe: tempPlayer.classe,
    stats,
    position: { x: 0, y: 0 }
  };

  players.push(player);
  localStorage.setItem("players", JSON.stringify(players));
  localStorage.removeItem("tempPlayer");

  window.location.href = "character.html";
});
