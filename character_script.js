// Render form and players
const form = document.getElementById("step1Form");
const list = document.getElementById("createdPlayers");

// Render created players
function renderCreatedPlayers() {
  const players = JSON.parse(localStorage.getItem("players")) || [];
  list.innerHTML = "";

  if (players.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Aucun personnage créé.";
    list.appendChild(li);
    return;
  }
// Render player list
    players.forEach(p => {
    const li = document.createElement("li");
// Render stats
    li.innerHTML = `
      <strong>${p.pseudo}</strong> — ${p.classe}<br>
      <small>
        Force : ${p.stats.force} |
        Vitesse : ${p.stats.vitesse} |
        Intelligence : ${p.stats.intelligence} |
        Vitalité : ${p.stats.vitalite}
      </small>
    `;
    list.appendChild(li);
  });
}

// Clear All Bouton
const clearAllBtn = document.getElementById("clearAll");

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Supprimer tous les personnages ?")) {
      localStorage.removeItem("players");
      renderCreatedPlayers();
    }
  });
}

// Submit player
form.addEventListener("submit", e => {
  e.preventDefault();

  const pseudo = e.target.pseudo.value.trim().toUpperCase();
  const classe = e.target.classe.value;

  if (!pseudo || !classe) return;

  const tempPlayer = { pseudo, classe };
  localStorage.setItem("tempPlayer", JSON.stringify(tempPlayer));

  window.location.href = "stats.html";
});

// Init
renderCreatedPlayers();
