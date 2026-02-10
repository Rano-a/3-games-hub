import Bille from "./bille.js";
import Explosion from "./explosion.js";
import { creerParticules } from "./particule.js";
import { circleCollide } from "./collisionUtils.js";

window.onload = init;

// Variables globales
let canvas, ctx;
let billes = [];
let explosions = [];
let particules = [];

// État du jeu
let etat = "MENU";
let niveau = 1;
let score = 0;
let combo = 0;
let billesDetruites = 0;
let aClique = false;

const niveaux = [
  { nbBilles: 60, quota: 10 }, // Niveau 1
  { nbBilles: 70, quota: 12 }, // Niveau 2
  { nbBilles: 80, quota: 20 }, // Niveau 3
  { nbBilles: 90, quota: 25 }, // Niveau 4
  { nbBilles: 100, quota: 30 }, // Niveau 5
];

const couleursNeon = [
  "#00ffff",
  "#ff00ff",
  "#ffff00",
  "#00ff00",
  "#ff6600",
  "#ff0066",
];

function init() {
  console.log("Initialisation de Neon Pop");

  canvas = document.querySelector("#gameCanvas");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("click", handleClick);

  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  canvas.width = 1200;
  canvas.height = 800;
}

function handleClick(e) {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  if (etat === "MENU") {
    demarrerNiveau();
  } else if (etat === "JEU EN COURS" && !aClique) {
    creerExplosionJoueur(x, y);
    aClique = true;
  } else if (etat === "NIVEAU TERMINE" || etat === "GAME OVER") {
    if (etat === "NIVEAU TERMINE") {
      niveau++;
      if (niveau > niveaux.length) {
        etat = "VICTOIRE";
      } else {
        demarrerNiveau();
      }
    } else {
      niveau = 1;
      score = 0;
      demarrerNiveau();
    }
  } else if (etat === "VICTOIRE") {
    etat = "MENU";
  }
}

function demarrerNiveau() {
  console.log("Démarrage niveau " + niveau);

  let config = niveaux[niveau - 1];

  // Réinitialisation
  billes = [];
  explosions = [];
  particules = [];
  combo = 0;
  billesDetruites = 0;
  aClique = false;

  // Création des billes
  for (let i = 0; i < config.nbBilles; i++) {
    let rayon = 10 + Math.random() * 10;
    let x = rayon + Math.random() * (canvas.width - rayon * 2);
    let y = rayon + Math.random() * (canvas.height - rayon * 2);
    let couleur = couleursNeon[Math.floor(Math.random() * couleursNeon.length)];

    billes.push(new Bille(x, y, couleur, rayon));
  }

  etat = "JEU EN COURS";
}

function creerExplosionJoueur(x, y) {
  // Explosion blanche du joueur
  let explosion = new Explosion(x, y, "#ffffff", 100);
  explosions.push(explosion);

  // Particules
  particules = particules.concat(creerParticules(x, y, "#ffffff", 10));
}

function creerExplosionBille(bille) {
  combo++;
  billesDetruites++;

  // Points avec multiplicateur de combo
  let points = 10 * combo;
  score += points;

  // Explosion de la couleur de la bille
  let explosion = new Explosion(
    bille.x,
    bille.y,
    bille.couleur,
    bille.rayon * 4,
  );
  explosions.push(explosion);

  // Particules
  particules = particules.concat(
    creerParticules(bille.x, bille.y, bille.couleur, 15),
  );

  bille.exploser();
}

// Game loop

function gameLoop() {
  // Effacer le canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner en fonction de l'état
  if (etat === "MENU") {
    drawMenu();
  } else if (etat === "JEU EN COURS") {
    drawJeu();
    updateJeu();
  } else if (etat === "NIVEAU TERMINE") {
    drawNiveauTermine();
  } else if (etat === "GAME OVER") {
    drawGameOver();
  } else if (etat === "VICTOIRE") {
    drawVictoire();
  }

  // Prochaine image (frame)
  requestAnimationFrame(gameLoop);
}

// Update

function updateJeu() {
  // Déplacer les billes
  billes.forEach((bille) => {
    bille.move(canvas.width, canvas.height);
  });

  // Mettre à jour les explosions
  explosions.forEach((explosion) => {
    explosion.update();
  });

  // Mettre à jour les particules
  particules.forEach((particule) => {
    particule.update();
  });

  // Détecter les collisions bille-explosion
  billes.forEach((bille) => {
    if (bille.explosee) return;

    explosions.forEach((explosion) => {
      if (!explosion.estActive()) return;

      if (
        circleCollide(
          bille.x,
          bille.y,
          bille.rayon,
          explosion.x,
          explosion.y,
          explosion.rayon,
        )
      ) {
        creerExplosionBille(bille);
      }
    });
  });

  // Nettoyer les objets terminés
  explosions = explosions.filter((e) => !e.terminee);
  particules = particules.filter((p) => !p.terminee);

  // Vérifier la fin de la réaction en chaîne
  if (aClique && explosions.length === 0) {
    verifierFinNiveau();
  }
}

function verifierFinNiveau() {
  let config = niveaux[niveau - 1];

  if (billesDetruites >= config.quota) {
    etat = "NIVEAU TERMINE";
    // Sauvegarder le score dans le localStorage (pour l'instant)
    sauvegarderScore();
  } else {
    etat = "GAME OVER";
  }
}

function sauvegarderScore() {
  let meilleurScore = localStorage.getItem("neonpop_score") || 0;
  if (score > meilleurScore) {
    localStorage.setItem("neonpop_score", score);
  }
}

// DESSIN

function drawMenu() {
  ctx.save();

  // Fond en dégradé
  let gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  gradient.addColorStop(0, "#1a0a2e");
  gradient.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Titre avec effet néon
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#00ffff";
  ctx.fillStyle = "#00ffff";
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.fillText("NEON POP", canvas.width / 2, canvas.height / 2 - 50);

  // Sous-titre
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff00ff";
  ctx.fillStyle = "#ff00ff";
  ctx.font = "30px Arial";
  ctx.fillText("Cliquez pour jouer", canvas.width / 2, canvas.height / 2 + 30);

  // Meilleur score
  let meilleurScore = localStorage.getItem("neonpop_score") || 0;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#ffff00";
  ctx.fillStyle = "#ffff00";
  ctx.font = "24px Arial";
  ctx.fillText(
    "Meilleur score : " + meilleurScore,
    canvas.width / 2,
    canvas.height / 2 + 100,
  );

  ctx.restore();
}

function drawJeu() {
  ctx.save();

  // Fond sombre
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner les billes
  billes.forEach((bille) => {
    bille.draw(ctx);
  });

  // Dessiner les explosions
  explosions.forEach((explosion) => {
    explosion.draw(ctx);
  });

  // Dessiner les particules
  particules.forEach((particule) => {
    particule.draw(ctx);
  });

  // Interface utilisateur
  drawInterface();

  ctx.restore();
}

function drawInterface() {
  let config = niveaux[niveau - 1];

  ctx.save();

  ctx.shadowBlur = 10;
  ctx.font = "24px Arial";
  ctx.textAlign = "left";

  // Score
  ctx.shadowColor = "#00ffff";
  ctx.fillStyle = "#00ffff";
  ctx.fillText("Score : " + score, 20, 40);

  // Niveau
  ctx.fillText("Niveau : " + niveau, 20, 70);

  // Objectif
  ctx.shadowColor = "#ff00ff";
  ctx.fillStyle = "#ff00ff";
  ctx.fillText("Objectif : " + billesDetruites + " / " + config.quota, 20, 100);

  // Combo
  if (combo > 1) {
    ctx.shadowColor = "#ffff00";
    ctx.fillStyle = "#ffff00";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("COMBO x" + combo, canvas.width / 2, 50);
  }

  // Indication si on n'a pas encore cliqué
  if (!aClique) {
    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Cliquez pour déclencher une explosion !",
      canvas.width / 2,
      canvas.height - 30,
    );
  }

  ctx.restore();
}

function drawNiveauTermine() {
  drawJeu();

  ctx.save();

  // overlay semi-transparent
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Texte
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#00ff00";
  ctx.fillStyle = "#00ff00";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("NIVEAU RÉUSSI !", canvas.width / 2, canvas.height / 2 - 30);

  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00ffff";
  ctx.fillStyle = "#00ffff";
  ctx.font = "30px Arial";
  ctx.fillText(
    "Score : " + score + " | Combo max : x" + combo,
    canvas.width / 2,
    canvas.height / 2 + 30,
  );

  ctx.font = "24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    "Cliquez pour continuer",
    canvas.width / 2,
    canvas.height / 2 + 100,
  );

  ctx.restore();
}

function drawGameOver() {
  drawJeu();

  ctx.save();

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 30;
  ctx.shadowColor = "#ff0000";
  ctx.fillStyle = "#ff0000";
  ctx.font = "bold 60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

  let config = niveaux[niveau - 1];
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff6666";
  ctx.fillStyle = "#ff6666";
  ctx.font = "30px Arial";
  ctx.fillText(
    billesDetruites + " / " + config.quota + " billes détruites",
    canvas.width / 2,
    canvas.height / 2 + 30,
  );

  ctx.font = "24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    "Cliquez pour recommencer",
    canvas.width / 2,
    canvas.height / 2 + 100,
  );

  ctx.restore();
}

function drawVictoire() {
  ctx.save();

  // Fond festif
  let gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  gradient.addColorStop(0, "#2a1a4e");
  gradient.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.shadowBlur = 40;
  ctx.shadowColor = "#ffff00";
  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 70px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🎉 VICTOIRE ! 🎉", canvas.width / 2, canvas.height / 2 - 50);

  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ffff";
  ctx.fillStyle = "#00ffff";
  ctx.font = "40px Arial";
  ctx.fillText(
    "Score final : " + score,
    canvas.width / 2,
    canvas.height / 2 + 30,
  );

  ctx.font = "24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    "Cliquez pour revenir au menu",
    canvas.width / 2,
    canvas.height / 2 + 100,
  );

  ctx.restore();
}
