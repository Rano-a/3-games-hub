import Joueur from "./joueur.js";
import Ancre from "./ancre.js";
import { initListeners } from "./ecouteurs.js";

const ZONE_DEFILEMENT = 0.42;
const DISTANCE_ACCROCHAGE = 190;

export default class Game {
  constructor(canvasId) {
    this.canvas = document.querySelector(canvasId);
    this.ctx = this.canvas.getContext("2d");

    this.etat = "MENU";
    this.score = 0;
    this.meilleurScore = parseInt(localStorage.getItem("stickyclimber_score")) || 0;

    this.offsetY = 0;
    this.hauteurGeneree = 0;

    this.joueur = null;
    this.ancres = [];
    this.dernierTemps = 0;

    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.loop = this.loop.bind(this);

    this.init();
  }

  init() {
    this.resizeCanvas();
    initListeners(this);
    requestAnimationFrame(this.loop);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  demarrer() {
    this.score = 0;
    this.offsetY = 0;
    this.hauteurGeneree = 0;
    this.ancres = [];

    let premiereAncre = new Ancre(this.canvas.width / 2, this.canvas.height * 0.65, "fixe", 22);
    this.ancres.push(premiereAncre);
    this.hauteurGeneree = premiereAncre.y;

    this.joueur = new Joueur(premiereAncre.x, premiereAncre.y + 105);
    this.joueur.attacherA(premiereAncre);

    this.genererAncres();
    this.etat = "JEU EN COURS";
  }

  getDifficulte() {
    if (this.score < 30)  return { rayon: 20, types: ["fixe"],                         ecartV: 175, nb: 3 };
    if (this.score < 70)  return { rayon: 17, types: ["fixe", "fixe", "mobile"],        ecartV: 200, nb: 2 };
    if (this.score < 130) return { rayon: 14, types: ["fixe", "mobile", "ephemere"],    ecartV: 215, nb: 2 };
    return                       { rayon: 11, types: ["mobile", "mobile", "ephemere"],  ecartV: 230, nb: 2 };
  }

  genererAncres() {
    let diff = this.getDifficulte();
    let cible = this.offsetY - this.canvas.height * 2.5;

    while (this.hauteurGeneree > cible) {
      let nb = diff.nb + (Math.random() < 0.4 ? 1 : 0);
      for (let i = 0; i < nb; i++) {
        let fraction = (i + 0.5 + (Math.random() - 0.5) * 0.5) / nb;
        let x = Math.max(50, Math.min(this.canvas.width - 50, fraction * this.canvas.width));
        let y = this.hauteurGeneree - diff.ecartV * (0.55 + Math.random() * 0.45);
        let type = diff.types[Math.floor(Math.random() * diff.types.length)];
        this.ancres.push(new Ancre(x, y, type, diff.rayon));
      }
      this.hauteurGeneree -= diff.ecartV;
    }
  }

  trouverAncreProche() {
    let meilleureAncre = null;
    let meilleureDist = DISTANCE_ACCROCHAGE;

    this.ancres.forEach((ancre) => {
      if (ancre.terminee) return;
      let sy = ancre.y - this.offsetY;
      if (sy < -ancre.rayon || sy > this.canvas.height + ancre.rayon) return;

      let dx = ancre.x - this.joueur.x;
      let dy = ancre.y - this.joueur.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < meilleureDist) {
        meilleureDist = dist;
        meilleureAncre = ancre;
      }
    });

    return meilleureAncre;
  }

  handleClick() {
    if (this.etat === "MENU" || this.etat === "GAME OVER") {
      this.demarrer();
      return;
    }
    if (this.etat !== "JEU EN COURS") return;

    if (this.joueur.attache) {
      this.joueur.detacher();
    } else {
      let ancre = this.trouverAncreProche();
      if (ancre) this.joueur.attacherA(ancre);
    }
  }

  loop(timestamp) {
    let delta = this.dernierTemps ? timestamp - this.dernierTemps : 16;
    this.dernierTemps = timestamp;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.etat === "MENU") {
      this.drawMenu();
    } else if (this.etat === "JEU EN COURS") {
      this.updateJeu(delta);
      this.drawJeu();
    } else if (this.etat === "GAME OVER") {
      this.drawGameOver();
    }

    requestAnimationFrame(this.loop);
  }

  updateJeu(delta) {
    this.joueur.update(this.canvas.width);

    this.ancres.forEach((ancre) => ancre.update(delta, this.canvas.width));

    // Si l'ancre courante disparaît (éphémère)
    if (this.joueur.attache && this.joueur.ancre && this.joueur.ancre.terminee) {
      this.joueur.detacher();
    }

    // Nettoyage : ancres trop basses (derrière le joueur)
    this.ancres = this.ancres.filter(
      (a) => !a.terminee && a.y < this.offsetY + this.canvas.height + 250
    );

    // Défilement caméra
    let joueurScreenY = this.joueur.y - this.offsetY;
    if (joueurScreenY < this.canvas.height * ZONE_DEFILEMENT) {
      this.offsetY = this.joueur.y - this.canvas.height * ZONE_DEFILEMENT;
      this.score = Math.max(this.score, Math.floor(-this.offsetY / 50));
    }

    // Génération de nouvelles ancres
    this.genererAncres();

    // Game over : joueur tombe hors de l'écran
    if (this.joueur.y > this.offsetY + this.canvas.height + 60) {
      this.etat = "GAME OVER";
      this.sauvegarderScore();
    }
  }

  sauvegarderScore() {
    this.meilleurScore = Math.max(this.score, this.meilleurScore);
    localStorage.setItem("stickyclimber_score", this.meilleurScore);
  }

  drawFond() {
    let ctx = this.ctx;

    let grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, "#04000f");
    grad.addColorStop(1, "#16083a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Étoiles en parallaxe (déterministes par index)
    let decalage = Math.floor(-this.offsetY * 0.12) % this.canvas.height;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 90; i++) {
      let x = ((i * 139 + 41) % 100) / 100 * this.canvas.width;
      let y = ((i * 257 + 89 + decalage) % this.canvas.height + this.canvas.height) % this.canvas.height;
      let r = i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Silhouettes de rochers en arrière-plan
    this.drawRochers();
  }

  drawRochers() {
    let ctx = this.ctx;
    let decalage = (-this.offsetY * 0.3) % (this.canvas.height * 1.5);

    ctx.fillStyle = "rgba(20, 10, 50, 0.7)";

    // Rocher gauche
    ctx.save();
    ctx.translate(0, decalage);
    ctx.beginPath();
    ctx.moveTo(0, this.canvas.height * 0.2);
    ctx.lineTo(this.canvas.width * 0.18, this.canvas.height * 0.05);
    ctx.lineTo(this.canvas.width * 0.22, this.canvas.height * 0.35);
    ctx.lineTo(this.canvas.width * 0.08, this.canvas.height * 0.5);
    ctx.lineTo(0, this.canvas.height * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, this.canvas.height * 0.7);
    ctx.lineTo(this.canvas.width * 0.14, this.canvas.height * 0.6);
    ctx.lineTo(this.canvas.width * 0.2, this.canvas.height * 0.85);
    ctx.lineTo(0, this.canvas.height * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Rocher droit
    ctx.save();
    ctx.translate(0, decalage - this.canvas.height * 0.75);
    ctx.beginPath();
    ctx.moveTo(this.canvas.width, this.canvas.height * 0.15);
    ctx.lineTo(this.canvas.width * 0.82, this.canvas.height * 0.08);
    ctx.lineTo(this.canvas.width * 0.78, this.canvas.height * 0.3);
    ctx.lineTo(this.canvas.width * 0.9, this.canvas.height * 0.48);
    ctx.lineTo(this.canvas.width, this.canvas.height * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.canvas.width, this.canvas.height * 0.65);
    ctx.lineTo(this.canvas.width * 0.84, this.canvas.height * 0.58);
    ctx.lineTo(this.canvas.width * 0.79, this.canvas.height * 0.82);
    ctx.lineTo(this.canvas.width, this.canvas.height * 0.88);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawJeu() {
    this.drawFond();
    this.ancres.forEach((ancre) => ancre.draw(this.ctx, this.offsetY));
    this.joueur.draw(this.ctx, this.offsetY);
    this.drawHUD();
  }

  drawHUD() {
    let ctx = this.ctx;
    ctx.save();

    ctx.shadowBlur = 14;
    ctx.shadowColor = "#ffd700";
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Hauteur : " + this.score + " m", 22, 42);

    ctx.shadowColor = "#aaaaaa";
    ctx.fillStyle = "rgba(200,200,200,0.8)";
    ctx.font = "18px Arial";
    ctx.fillText("Record : " + this.meilleurScore + " m", 22, 70);

    if (!this.joueur.attache) {
      ctx.shadowColor = "#ffffff";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Clic ou Espace pour s'accrocher !", this.canvas.width / 2, this.canvas.height - 28);
    }

    ctx.restore();
  }

  drawMenu() {
    this.drawFond();

    let ctx = this.ctx;
    ctx.save();

    ctx.shadowBlur = 40;
    ctx.shadowColor = "#ffd700";
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 70px Arial";
    ctx.textAlign = "center";
    ctx.fillText("STICKY CLIMBER", this.canvas.width / 2, this.canvas.height / 2 - 70);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,215,0,0.4)";
    ctx.fillRect(this.canvas.width / 2 - 180, this.canvas.height / 2 - 50, 360, 2);

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Arial";
    ctx.fillText("Cliquez pour jouer", this.canvas.width / 2, this.canvas.height / 2 + 10);

    ctx.fillStyle = "rgba(180,180,180,0.7)";
    ctx.font = "18px Arial";
    ctx.fillText("Clic ou Espace pour lancer, à nouveau pour s'accrocher", this.canvas.width / 2, this.canvas.height / 2 + 50);

    ctx.shadowColor = "#ffd700";
    ctx.fillStyle = "#ffd700";
    ctx.font = "22px Arial";
    ctx.fillText("Record : " + this.meilleurScore + " m", this.canvas.width / 2, this.canvas.height / 2 + 100);

    ctx.restore();
  }

  drawGameOver() {
    this.drawFond();

    let ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.shadowBlur = 35;
    ctx.shadowColor = "#ff4444";
    ctx.fillStyle = "#ff4444";
    ctx.font = "bold 66px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2 - 55);

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ffd700";
    ctx.fillStyle = "#ffd700";
    ctx.font = "34px Arial";
    ctx.fillText("Hauteur : " + this.score + " m", this.canvas.width / 2, this.canvas.height / 2 + 15);

    ctx.shadowColor = "#aaaaaa";
    ctx.fillStyle = "rgba(200,200,200,0.8)";
    ctx.font = "22px Arial";
    ctx.fillText("Record : " + this.meilleurScore + " m", this.canvas.width / 2, this.canvas.height / 2 + 60);

    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "22px Arial";
    ctx.fillText("Clic ou Espace pour rejouer", this.canvas.width / 2, this.canvas.height / 2 + 115);

    ctx.restore();
  }
}
