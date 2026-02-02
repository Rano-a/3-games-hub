// 1. Les données des 3 jeux
// C'est ici que tu modifies les textes, les images et les liens pour chaque jeu.
const games = [
  {
    // JEU 1 (Celui par défaut)
    name: "Le défi de l'Empereur",
    title: "BRAVEZ <br />LA GRANDE MURAILLE",
    subtitle: "Gauche, milieu, droite : choisissez votre voie sur la plus grande merveille du monde. Évitez les obstacles, testez vos réflexes et établissez un score digne de l'Empereur.",
    img: "https://placehold.co/600x400", // Vérifie que ce chemin est bon
    linkPlay: "#",   // Lien vers la page de jeu 1
    linkGh: "#",     // Lien vers le Github du jeu 1
    score: 0         // Score par défaut ou à récupérer plus tard
  },
  {
    // JEU 2
    name: "Chain reaction : Neon pop",
    title: "UN CLIC <br />UNE RÉACTION </br />UN CHAOS TOTAL",
    subtitle: "Déclenchez l'étincelle parfaite dans un monde de néons. Une seule chance pour créer la réaction en chaîne la plus massive et pulvériser vos scores. Serez-vous assez précis pour vider l'écran ?",
    img: "https://placehold.co/600x400", // Remplace par ton image
    linkPlay: "#",
    linkGh: "#",
    score: 0
  },
  {
    // JEU 3
    name: "Sticky climber",
    title: "DEFIEZ <br />LA GRAVITE",
    subtitle: "Accrochez-vous, visez haut et ne lâchez rien. Maîtrisez l'art de la rotation pour grimper toujours plus loin dans ce défi vertical infini. Un seul faux mouvement, et c'est la chute !",
    img: "https://placehold.co/600x400", // Remplace par ton image
    linkPlay: "#",
    linkGh: "#",
    score: 0
  }
];

// 2. Sélection des éléments HTML à modifier
const domElements = {
  gameName: document.getElementById('game-name'),
  gameTitle: document.getElementById('game-title'),
  gameSubtitle: document.getElementById('game-subtitle'),
  gameImg: document.querySelector('.game-container-right img'),
  btnPlay: document.querySelector('#btn-play a'), // On cible le lien <a> dans le bouton
  btnGh: document.querySelector('#btn-gh a'),     // On cible le lien <a> dans le bouton
  scoreSpan: document.getElementById('game-score')
};

// 3. Variables de gestion
let currentIndex = 0; // On commence par le premier jeu (index 0)

// 4. Fonction pour mettre à jour l'affichage
function updateDisplay() {
  const currentGame = games[currentIndex];

  // Mise à jour des textes
  domElements.gameName.textContent = currentGame.name;
  domElements.gameTitle.innerHTML = currentGame.title; // innerHTML pour gérer le <br />
  domElements.gameSubtitle.textContent = currentGame.subtitle;
  
  // Mise à jour de l'image (source et texte alternatif)
  domElements.gameImg.src = currentGame.img;
  domElements.gameImg.alt = "Capture d'écran du jeu " + currentGame.name;

  // Mise à jour des liens
  domElements.btnPlay.href = currentGame.linkPlay;
  domElements.btnGh.href = currentGame.linkGh;

  // Mise à jour du score (optionnel pour l'instant)
  domElements.scoreSpan.textContent = currentGame.score;
}

// 5. Gestion des clics sur les boutons (Événements)

// Bouton GAUCHE (Va vers le jeu suivant comme demandé)
document.querySelector('.nav-left-btn').addEventListener('click', () => {
  currentIndex++; 
  // Si on dépasse le dernier jeu, on revient au premier (boucle)
  if (currentIndex >= games.length) {
    currentIndex = 0;
  }
  updateDisplay();
});

// Bouton DROIT (Va vers le jeu précédent)
document.querySelector('.nav-right-btn').addEventListener('click', () => {
  currentIndex--;
  // Si on est avant le premier jeu, on va au dernier
  if (currentIndex < 0) {
    currentIndex = games.length - 1;
  }
  updateDisplay();
});