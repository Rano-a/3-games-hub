const domElements = {
  body: document.body,
  navLogo: document.querySelector(".nav-left img"),
  gameName: document.getElementById("game-name"),
  gameTitle: document.getElementById("game-title"),
  gameSubtitle: document.getElementById("game-subtitle"),
  gameImg: document.querySelector(".game-container-right img"),
  btnPlay: document.querySelector("#btn-play a"),
  btnGh: document.querySelector("#btn-gh a"),
  scoreSpan: document.getElementById("game-score"),
};

let currentIndex = 0;

function updateDisplay() {
  const currentGame = games[currentIndex];

  domElements.body.style.backgroundImage = `url('${currentGame.bg}')`;

  domElements.body.classList.remove(
    "theme-samurai",
    "theme-neon",
    "theme-sticky",
  );
  domElements.body.classList.add(currentGame.theme);

  domElements.navLogo.src = currentGame.logo;
  domElements.gameName.textContent = currentGame.name;

  domElements.gameTitle.innerHTML = currentGame.title;
  domElements.gameSubtitle.textContent = currentGame.subtitle;

  domElements.gameImg.src = currentGame.img;
  domElements.gameImg.alt = "Capture d'écran du jeu " + currentGame.name;

  domElements.btnPlay.href = currentGame.linkPlay;
  domElements.btnGh.href = currentGame.linkGh;

  if (currentGame.linkPlay !== "#") {
    domElements.btnPlay.target = "_blank";
  } else {
    domElements.btnPlay.removeAttribute("target");
  }

  // LocalStorage pour le moment
  let scoreKey = null;
  if (currentGame.theme === "theme-neon") {
    scoreKey = "neonpop_score";
  }

  if (scoreKey) {
    currentGame.score = parseInt(localStorage.getItem(scoreKey)) || 0;
  }

  domElements.scoreSpan.textContent = currentGame.score;
}

updateDisplay();

document.querySelector(".nav-left-btn").addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= games.length) currentIndex = 0;
  updateDisplay();
});

document.querySelector(".nav-right-btn").addEventListener("click", () => {
  currentIndex--;
  if (currentIndex < 0) currentIndex = games.length - 1;
  updateDisplay();
});

// Bloquer l'accès au jeu si l'utilisateur n'est pas connecté
document.getElementById("btn-play").addEventListener("click", (e) => {
  const session = localStorage.getItem("game_hub_session");
  if (!session) {
    e.preventDefault();
    document.getElementById("auth-overlay").classList.add("active");
  }
});
