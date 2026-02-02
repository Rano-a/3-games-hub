// 1. Les données des 3 jeux
// C'est ici que tu modifies les textes, les images et les liens pour chaque jeu.
const games = [
  {
    // JEU 1
    name: "Le défi de l'Empereur",
    title: "BRAVEZ <br />LA GRANDE MURAILLE",
    subtitle: "Gauche, milieu, droite : choisissez votre voie sur la plus grande merveille du monde. Évitez les obstacles, testez vos réflexes et établissez un score digne de l'Empereur.",
    img: "assets/img/samurai.png",
    linkPlay: "#",
    linkGh: "#",
    score: 0,
    // Nouveaux champs de style
    theme: "theme-samurai",
    bg: "assets/img/61126.jpg", 
    logo: "assets/img/logogame1.png"
  },
  {
    // JEU 2
    name: "Chain reaction : Neon pop",
    title: "UN CLIC <br />UNE RÉACTION </br />UN CHAOS TOTAL",
    subtitle: "Déclenchez l'étincelle parfaite dans un monde de néons. Une seule chance pour créer la réaction en chaîne la plus massive et pulvériser vos scores.",
    img: "assets/img/neon-personnage.png",
    linkPlay: "#",
    linkGh: "#",
    score: 0,
    // Nouveaux champs de style
    theme: "theme-neon",
    bg: "assets/img/neon-bg.webp", // Créer cette image ou mettre un placeholder
    logo: "assets/img/logogame2.png" // Créer cette image
  },
  {
    // JEU 3
    name: "Sticky climber",
    title: "DEFIEZ <br />LA GRAVITE",
    subtitle: "Accrochez-vous, visez haut et ne lâchez rien. Maîtrisez l'art de la rotation pour grimper toujours plus loin dans ce défi vertical infini.",
    img: "assets/img/climber.png",
    linkPlay: "#",
    linkGh: "#",
    score: 0,
    // Nouveaux champs de style
    theme: "theme-sticky",
    bg: "assets/img/moutain-bg.jpg", // Créer cette image
    logo: "assets/img/logogame3.png" // Créer cette image
  }
];

// 2. Sélection des éléments HTML à modifier
const domElements = {
  body: document.body,
  navLogo: document.querySelector('.nav-left img'), // Ajout du logo navbar
  gameName: document.getElementById('game-name'),
  gameTitle: document.getElementById('game-title'),
  gameSubtitle: document.getElementById('game-subtitle'),
  gameImg: document.querySelector('.game-container-right img'),
  btnPlay: document.querySelector('#btn-play a'),
  btnGh: document.querySelector('#btn-gh a'),
  scoreSpan: document.getElementById('game-score')
};

let currentIndex = 0;

function updateDisplay() {
  const currentGame = games[currentIndex];

  // 1. Mise à jour du style global (Body)
  // On change l'image de fond
  domElements.body.style.backgroundImage = `url('${currentGame.bg}')`;
  
  // On retire toutes les classes de thème possibles et on ajoute la bonne
  domElements.body.classList.remove('theme-samurai', 'theme-neon', 'theme-sticky');
  domElements.body.classList.add(currentGame.theme);

  // 2. Mise à jour Navbar
  domElements.navLogo.src = currentGame.logo;
  domElements.gameName.textContent = currentGame.name;

  // 3. Mise à jour Contenu
  domElements.gameTitle.innerHTML = currentGame.title;
  domElements.gameSubtitle.textContent = currentGame.subtitle;
  
  domElements.gameImg.src = currentGame.img;
  domElements.gameImg.alt = "Capture d'écran du jeu " + currentGame.name;

  domElements.btnPlay.href = currentGame.linkPlay;
  domElements.btnGh.href = currentGame.linkGh;
  domElements.scoreSpan.textContent = currentGame.score;
}

// Initialisation au chargement pour appliquer le thème du premier jeu
updateDisplay();

document.querySelector('.nav-left-btn').addEventListener('click', () => {
  currentIndex++; 
  if (currentIndex >= games.length) currentIndex = 0;
  updateDisplay();
});

document.querySelector('.nav-right-btn').addEventListener('click', () => {
  currentIndex--;
  if (currentIndex < 0) currentIndex = games.length - 1;
  updateDisplay();
}); 