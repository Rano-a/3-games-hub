let currentTab = "global";
let leaderboardData = [];

const GAME_LABELS = {
  global:  "Score Global",
  emperor: "Hauteur (m)",
  neon:    "Score",
  sticky:  "Hauteur (m)",
};

async function fetchLeaderboard() {
  const body = document.getElementById("leaderboard-body");
  try {
    const res = await fetch("/api/leaderboard");
    leaderboardData = await res.json();
    renderTable();
  } catch {
    body.innerHTML = '<tr><td colspan="3" class="empty">Impossible de charger le classement.</td></tr>';
  }
}

function getScore(user, tab) {
  if (tab === "global")  return user.globalScore;
  if (tab === "emperor") return user.scores.emperor;
  if (tab === "neon")    return user.scores.neon;
  if (tab === "sticky")  return user.scores.sticky;
  return 0;
}

function renderTable() {
  const session = localStorage.getItem("game_hub_session");

  const sorted = [...leaderboardData]
    .map((u) => ({ ...u, displayScore: getScore(u, currentTab) }))
    .sort((a, b) => b.displayScore - a.displayScore);

  document.getElementById("score-label").textContent = GAME_LABELS[currentTab];

  const body = document.getElementById("leaderboard-body");
  if (sorted.length === 0) {
    body.innerHTML = '<tr><td colspan="3" class="empty">Aucun joueur inscrit.</td></tr>';
    return;
  }

  body.innerHTML = sorted
    .map((user, i) => {
      const rank = i + 1;
      const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
      const isMe = user.username === session;
      return `
        <tr class="${isMe ? "me" : ""}">
          <td class="rank">${medal}</td>
          <td class="username">${user.username}${isMe ? ' <span class="you">vous</span>' : ""}</td>
          <td class="score">${user.displayScore}</td>
        </tr>`;
    })
    .join("");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTab = btn.dataset.tab;
    renderTable();
  });
});

fetchLeaderboard();
