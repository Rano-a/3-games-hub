import Joueur from "./joueur.js";
import Obstacle from "./obstacle.js";
import { initListeners } from "./ecouteurs.js";

const VITESSE_INITIALE = 2200;
const VITESSE_MINIMUM = 800;
const INTERVALLE_SPAWN_INITIAL = 1800;
const VIES_INITIALES = 3;

export default class Game {
  constructor() {
    this.piste = document.getElementById("piste");

    this.etat = "MENU";
    this.score = 0;
    this.vies = VIES_INITIALES;
    this.vitesse = VITESSE_INITIALE;
    this.intervalleSpawn = INTERVALLE_SPAWN_INITIAL;

    this.dernierSpawn = 0;
    this.dernierTemps = 0;
    this.scoreTimer = 0;

    this.joueur = null;
    this.obstacles = [];

    this.loop = this.loop.bind(this);
  }

  init() {
    initListeners(this);
    this.afficherMenu();
    requestAnimationFrame(this.loop);
  }

  demarrer() {
    this.score = 0;
    this.vies = VIES_INITIALES;
    this.vitesse = VITESSE_INITIALE;
    this.intervalleSpawn = INTERVALLE_SPAWN_INITIAL;
    this.scoreTimer = 0;
    this.dernierSpawn = 0;
    this.dernierTemps = 0;

    this.obstacles.forEach((o) => o.detruire());
    this.obstacles = [];

    if (this.joueur) this.joueur.detruire();
    this.joueur = new Joueur(this.piste);

    document.getElementById("ecran-menu").classList.remove("actif");
    document.getElementById("ecran-game-over").classList.remove("actif");

    this.etat = "JEU EN COURS";
  }

  loop(timestamp) {
    if (this.etat === "JEU EN COURS") {
      let delta = this.dernierTemps ? timestamp - this.dernierTemps : 16;
      this.updateJeu(timestamp, delta);
    }
    this.dernierTemps = timestamp;
    requestAnimationFrame(this.loop);
  }

  updateJeu(timestamp, delta) {
    this.scoreTimer += delta;
    if (this.scoreTimer >= 500) {
      this.score += 1;
      this.scoreTimer -= 500;
      this.mettreAJourHUD();
    }

    let nouvelleVitesse = Math.max(
      VITESSE_MINIMUM,
      VITESSE_INITIALE - Math.floor(this.score / 10) * 100,
    );
    if (nouvelleVitesse !== this.vitesse) {
      this.vitesse = nouvelleVitesse;
      this.intervalleSpawn = Math.max(600, this.vitesse * 0.8);
    }

    if (timestamp - this.dernierSpawn >= this.intervalleSpawn) {
      this.spawnerObstacle(timestamp);
    }

    this.detecterCollisions();

    this.obstacles = this.obstacles.filter((o) => !o.terminee);

    this.joueur.mettreAJourInvincibilite(delta);
  }

  spawnerObstacle(timestamp) {
    let voie = Math.floor(Math.random() * 3);
    this.obstacles.push(new Obstacle(voie, this.vitesse, this.piste));
    this.dernierSpawn = timestamp;
  }

  detecterCollisions() {
    if (this.joueur.invincible) return;
    let rJ = this.joueur.el.getBoundingClientRect();

    this.obstacles.forEach((o) => {
      if (o.terminee || o.voie !== this.joueur.voie) return;
      let rO = o.el.getBoundingClientRect();
      let collision =
        rJ.left < rO.right &&
        rJ.right > rO.left &&
        rJ.top < rO.bottom &&
        rJ.bottom > rO.top;
      if (collision) this.gererCollision(o);
    });
  }

  gererCollision(obstacle) {
    obstacle.detruire();
    this.vies--;
    this.mettreAJourHUD();

    if (this.vies <= 0) {
      this.gameOver();
    } else {
      this.joueur.flashInvincible();
    }
  }

  gameOver() {
    this.etat = "GAME OVER";
    this.sauvegarderScore();

    let meilleur = parseInt(localStorage.getItem("emperor_score")) || 0;
    document.getElementById("go-score").textContent = "Score : " + this.score;
    document.getElementById("go-meilleur").textContent =
      "Meilleur score : " + meilleur;
    document.getElementById("ecran-game-over").classList.add("actif");
  }

  sauvegarderScore() {
    let meilleur = parseInt(localStorage.getItem("emperor_score")) || 0;
    if (this.score > meilleur) {
      localStorage.setItem("emperor_score", this.score);
    }
  }

  afficherMenu() {
    let meilleur = parseInt(localStorage.getItem("emperor_score")) || 0;
    document.getElementById("menu-meilleur-score").textContent =
      "Meilleur score : " + meilleur;
    document.getElementById("ecran-menu").classList.add("actif");
  }

  mettreAJourHUD() {
    let coeurs = "❤️".repeat(this.vies) + "🖤".repeat(VIES_INITIALES - this.vies);
    document.getElementById("hud-vies").textContent = coeurs;
    document.getElementById("hud-score").textContent = "Score : " + this.score;
  }
}
