import Bille from "./bille.js";
import Explosion from "./explosion.js";
import { creerParticules } from "./particule.js";
import { circleCollide } from "./collisionUtils.js";
import { initListeners } from "./ecouteurs.js";

const NIVEAUX = [
  { nbBilles: 60, quota: 10 }, // Niveau 1
  { nbBilles: 70, quota: 12 }, // Niveau 2
  { nbBilles: 80, quota: 20 }, // Niveau 3
  { nbBilles: 90, quota: 25 }, // Niveau 4
  { nbBilles: 100, quota: 30 }, // Niveau 5
];

const COULEURS_NEON = [
  "#00ffff",
  "#ff00ff",
  "#ffff00",
  "#00ff00",
  "#ff6600",
  "#ff0066",
];

export default class Game {
  constructor(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.ctx = this.canvas.getContext("2d");

    // État du jeu
    this.etat = "MENU";
    this.niveau = 1;
    this.score = 0;
    this.combo = 0;
    this.billesDetruites = 0;
    this.aClique = false;
    this.vies = 3;

    // Entités
    this.billes = [];
    this.explosions = [];
    this.particules = [];

    // Bindings
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    console.log("Initialisation de Neon Pop (Game Class)");
    this.resizeCanvas();

    // Initialisation des écouteurs
    initListeners(this);

    // Démarrage de la boucle
    requestAnimationFrame(this.loop);
  }

  resizeCanvas() {
    this.canvas.width = 1200;
    this.canvas.height = 800;
  }

  handleClick(e) {
    let rect = this.canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (this.etat === "MENU") {
      this.demarrerNiveau();
    } else if (this.etat === "JEU EN COURS" && !this.aClique) {
      this.creerExplosionJoueur(x, y);
      this.aClique = true;
    } else if (
      this.etat === "NIVEAU TERMINE" ||
      this.etat === "GAME OVER" ||
      this.etat === "VIE PERDUE"
    ) {
      if (this.etat === "NIVEAU TERMINE") {
        this.niveau++;
        if (this.niveau > NIVEAUX.length) {
          this.etat = "VICTOIRE";
        } else {
          this.demarrerNiveau();
        }
      } else if (this.etat === "VIE PERDUE") {
        this.demarrerNiveau();
      } else {
        this.niveau = 1;
        this.score = 0;
        this.vies = 3;
        this.demarrerNiveau();
      }
    } else if (this.etat === "VICTOIRE") {
      this.etat = "MENU";
      this.vies = 3;
      this.score = 0;
      this.niveau = 1;
    }
  }

  demarrerNiveau() {
    console.log("Démarrage niveau " + this.niveau);

    let config = NIVEAUX[this.niveau - 1];

    // Réinitialisation
    this.billes = [];
    this.explosions = [];
    this.particules = [];
    this.combo = 0;
    this.billesDetruites = 0;
    this.aClique = false;

    // Création des billes
    for (let i = 0; i < config.nbBilles; i++) {
      let rayon = 10 + Math.random() * 10;
      let x = rayon + Math.random() * (this.canvas.width - rayon * 2);
      let y = rayon + Math.random() * (this.canvas.height - rayon * 2);
      let couleur =
        COULEURS_NEON[Math.floor(Math.random() * COULEURS_NEON.length)];

      this.billes.push(new Bille(x, y, couleur, rayon));
    }

    this.etat = "JEU EN COURS";
  }

  creerExplosionJoueur(x, y) {
    // Explosion blanche du joueur
    let explosion = new Explosion(x, y, "#ffffff", 100);
    this.explosions.push(explosion);

    // Particules
    this.particules = this.particules.concat(
      creerParticules(x, y, "#ffffff", 10),
    );
  }

  creerExplosionBille(bille) {
    this.combo++;
    this.billesDetruites++;

    // Points avec multiplicateur de combo
    let points = 10 * this.combo;
    this.score += points;

    // Explosion de la couleur de la bille
    let explosion = new Explosion(
      bille.x,
      bille.y,
      bille.couleur,
      bille.rayon * 4,
    );
    this.explosions.push(explosion);

    // Particules
    this.particules = this.particules.concat(
      creerParticules(bille.x, bille.y, bille.couleur, 15),
    );

    bille.exploser();
  }

  loop() {
    // Effacer le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner en fonction de l'état
    if (this.etat === "MENU") {
      this.drawMenu();
    } else if (this.etat === "JEU EN COURS") {
      this.drawJeu();
      this.updateJeu();
    } else if (this.etat === "NIVEAU TERMINE") {
      this.drawNiveauTermine();
    } else if (this.etat === "GAME OVER") {
      this.drawGameOver();
    } else if (this.etat === "VIE PERDUE") {
      this.drawViePerdue();
    } else if (this.etat === "VICTOIRE") {
      this.drawVictoire();
    }

    requestAnimationFrame(this.loop);
  }

  updateJeu() {
    // Déplacer les billes
    this.billes.forEach((bille) => {
      bille.move(this.canvas.width, this.canvas.height);
    });

    // Mettre à jour les explosions
    this.explosions.forEach((explosion) => {
      explosion.update();
    });

    // Mettre à jour les particules
    this.particules.forEach((particule) => {
      particule.update();
    });

    // Détecter les collisions bille-explosion
    this.billes.forEach((bille) => {
      if (bille.explosee) return;

      this.explosions.forEach((explosion) => {
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
          this.creerExplosionBille(bille);
        }
      });
    });

    // Nettoyer les objets terminés
    this.explosions = this.explosions.filter((e) => !e.terminee);
    this.particules = this.particules.filter((p) => !p.terminee);

    // Vérifier la fin de la réaction en chaîne
    if (this.aClique && this.explosions.length === 0) {
      this.verifierFinNiveau();
    }
  }

  verifierFinNiveau() {
    let config = NIVEAUX[this.niveau - 1];

    if (this.billesDetruites >= config.quota) {
      this.etat = "NIVEAU TERMINE";
      // Sauvegarder le score dans le localStorage
      this.sauvegarderScore();
    } else {
      this.vies--;
      if (this.vies > 0) {
        this.etat = "VIE PERDUE";
      } else {
        this.etat = "GAME OVER";
      }
    }
  }

  sauvegarderScore() {
    let meilleur = parseInt(localStorage.getItem("neonpop_score")) || 0;
    if (this.score > meilleur) {
      meilleur = this.score;
      localStorage.setItem("neonpop_score", meilleur);
    }
    const username = localStorage.getItem("game_hub_session");
    if (username && meilleur > 0) {
      fetch("/api/leaderboard/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, game: "neon", score: meilleur }),
      }).catch((e) => console.error("Erreur sync score neon :", e));
    }
  }

  drawMenu() {
    this.ctx.save();

    // Fond en dégradé
    let gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width / 2,
    );
    gradient.addColorStop(0, "#1a0a2e");
    gradient.addColorStop(1, "#0a0a0a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Titre avec effet néon
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "#00ffff";
    this.ctx.fillStyle = "#00ffff";
    this.ctx.font = "bold 80px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "NEON POP",
      this.canvas.width / 2,
      this.canvas.height / 2 - 50,
    );

    // Sous-titre
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ff00ff";
    this.ctx.fillStyle = "#ff00ff";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(
      "Cliquez pour jouer",
      this.canvas.width / 2,
      this.canvas.height / 2 + 30,
    );

    // Meilleur score
    let meilleurScore = localStorage.getItem("neonpop_score") || 0;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#ffff00";
    this.ctx.fillStyle = "#ffff00";
    this.ctx.font = "24px Arial";
    this.ctx.fillText(
      "Meilleur score : " + meilleurScore,
      this.canvas.width / 2,
      this.canvas.height / 2 + 100,
    );

    this.ctx.restore();
  }

  drawJeu() {
    this.ctx.save();

    // Fond sombre
    this.ctx.fillStyle = "#0a0a0a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner les billes
    this.billes.forEach((bille) => {
      bille.draw(this.ctx);
    });

    // Dessiner les explosions
    this.explosions.forEach((explosion) => {
      explosion.draw(this.ctx);
    });

    // Dessiner les particules
    this.particules.forEach((particule) => {
      particule.draw(this.ctx);
    });

    // Interface utilisateur
    this.drawInterface();

    this.ctx.restore();
  }

  drawInterface() {
    let config = NIVEAUX[this.niveau - 1];

    this.ctx.save();

    this.ctx.shadowBlur = 10;
    this.ctx.font = "24px Arial";
    this.ctx.textAlign = "left";

    // Score
    this.ctx.shadowColor = "#00ffff";
    this.ctx.fillStyle = "#00ffff";
    this.ctx.fillText("Score : " + this.score, 20, 40);

    // Niveau
    this.ctx.fillText("Niveau : " + this.niveau, 20, 70);

    // Vies
    this.ctx.shadowColor = "#ff0000";
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillText("Vies : " + this.vies, 20, 100);

    // Objectif
    this.ctx.shadowColor = "#ff00ff";
    this.ctx.fillStyle = "#ff00ff";
    this.ctx.fillText(
      "Objectif : " + this.billesDetruites + " / " + config.quota,
      20,
      130,
    );

    // Combo
    if (this.combo > 1) {
      this.ctx.shadowColor = "#ffff00";
      this.ctx.fillStyle = "#ffff00";
      this.ctx.font = "bold 36px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText("COMBO x" + this.combo, this.canvas.width / 2, 50);
    }

    // Indication si on n'a pas encore cliqué
    if (!this.aClique) {
      this.ctx.shadowColor = "#ffffff";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "20px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "Cliquez pour déclencher une explosion !",
        this.canvas.width / 2,
        this.canvas.height - 30,
      );
    }

    this.ctx.restore();
  }

  drawNiveauTermine() {
    this.drawJeu();

    this.ctx.save();

    // overlay semi-transparent
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Texte
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "#00ff00";
    this.ctx.fillStyle = "#00ff00";
    this.ctx.font = "bold 60px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "NIVEAU RÉUSSI !",
      this.canvas.width / 2,
      this.canvas.height / 2 - 30,
    );

    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#00ffff";
    this.ctx.fillStyle = "#00ffff";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(
      "Score : " + this.score + " | Combo max : x" + this.combo,
      this.canvas.width / 2,
      this.canvas.height / 2 + 30,
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(
      "Cliquez pour continuer",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100,
    );

    this.ctx.restore();
  }

  drawGameOver() {
    this.drawJeu();

    this.ctx.save();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "#ff0000";
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 60px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "GAME OVER",
      this.canvas.width / 2,
      this.canvas.height / 2 - 30,
    );

    let config = NIVEAUX[this.niveau - 1];
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ff6666";
    this.ctx.fillStyle = "#ff6666";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(
      this.billesDetruites + " / " + config.quota + " billes détruites",
      this.canvas.width / 2,
      this.canvas.height / 2 + 30,
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(
      "Cliquez pour recommencer",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100,
    );

    this.ctx.restore();
  }

  drawVictoire() {
    this.ctx.save();

    // Fond festif
    let gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width / 2,
    );
    gradient.addColorStop(0, "#2a1a4e");
    gradient.addColorStop(1, "#0a0a0a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = "#ffff00";
    this.ctx.fillStyle = "#ffff00";
    this.ctx.font = "bold 70px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "🎉 VICTOIRE ! 🎉",
      this.canvas.width / 2,
      this.canvas.height / 2 - 50,
    );

    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = "#00ffff";
    this.ctx.fillStyle = "#00ffff";
    this.ctx.font = "40px Arial";
    this.ctx.fillText(
      "Score final : " + this.score,
      this.canvas.width / 2,
      this.canvas.height / 2 + 30,
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(
      "Cliquez pour revenir au menu",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100,
    );

    this.ctx.restore();
  }

  drawViePerdue() {
    this.drawJeu();

    this.ctx.save();

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = "#ff0000";
    this.ctx.fillStyle = "#ff0000";
    this.ctx.font = "bold 60px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "VIE PERDUE",
      this.canvas.width / 2,
      this.canvas.height / 2 - 30,
    );

    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = "#ff6666";
    this.ctx.fillStyle = "#ff6666";
    this.ctx.font = "30px Arial";
    this.ctx.fillText(
      "Il vous reste " + this.vies + " vies",
      this.canvas.width / 2,
      this.canvas.height / 2 + 30,
    );

    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(
      "Cliquez pour réessayer",
      this.canvas.width / 2,
      this.canvas.height / 2 + 100,
    );

    this.ctx.restore();
  }
}
