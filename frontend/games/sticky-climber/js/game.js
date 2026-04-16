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
    let W = this.canvas.width;
    let H = this.canvas.height;

    let grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#5aaee0");
    grad.addColorStop(0.55, "#b8ddf5");
    grad.addColorStop(1, "#e8f4fb");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    this.drawMontagne();
    this.drawNuages();
  }

  drawMontagne() {
    let ctx = this.ctx;
    let W = this.canvas.width;
    let H = this.canvas.height;
    let decalage = -this.offsetY * 0.02;

    ctx.save();
    ctx.translate(0, decalage);

    let sx = W * 0.5;
    let sy = -H * 0.8;
    let baseY = H * 1.0;

    // Face gauche dans l'ombre
    ctx.fillStyle = "#6e8fa8";
    ctx.beginPath();
    ctx.moveTo(-W * 0.1, baseY);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx, baseY);
    ctx.closePath();
    ctx.fill();

    // Face droite éclairée
    ctx.fillStyle = "#9abccc";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(W * 1.1, baseY);
    ctx.lineTo(sx, baseY);
    ctx.closePath();
    ctx.fill();

    // Calotte neigeuse
    let neigeY = sy + (baseY - sy) * 0.28;
    ctx.fillStyle = "#eef5ff";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + W * 0.2,  neigeY + H * 0.015);
    ctx.lineTo(sx + W * 0.06, neigeY + H * 0.045);
    ctx.lineTo(sx,            neigeY + H * 0.030);
    ctx.lineTo(sx - W * 0.06, neigeY + H * 0.045);
    ctx.lineTo(sx - W * 0.16, neigeY);
    ctx.closePath();
    ctx.fill();

    // Ombre sur la neige côté gauche
    ctx.fillStyle = "rgba(130, 170, 205, 0.42)";
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx,            neigeY + H * 0.030);
    ctx.lineTo(sx - W * 0.06, neigeY + H * 0.045);
    ctx.lineTo(sx - W * 0.16, neigeY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawNuages() {
    let ctx = this.ctx;
    let W = this.canvas.width;
    let H = this.canvas.height;
    let decalage = (-this.offsetY * 0.1) % (H * 3);

    const nuages = [
      { x: 0.14, y: 0.10, r: 0.09 },
      { x: 0.72, y: 0.22, r: 0.07 },
      { x: 0.42, y: 0.38, r: 0.08 },
      { x: 0.86, y: 0.07, r: 0.055 },
      { x: 0.28, y: 0.65, r: 0.075 },
      { x: 0.60, y: 0.80, r: 0.06 },
    ];

    ctx.save();
    ctx.translate(0, decalage);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";

    nuages.forEach((n) => {
      let cx = n.x * W;
      let cy = n.y * H;
      let r  = n.r * W;
      ctx.beginPath();
      ctx.arc(cx,            cy,            r,        0, Math.PI * 2);
      ctx.arc(cx + r * 0.9,  cy - r * 0.3,  r * 0.70, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.75, cy - r * 0.22, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    });

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

    ctx.fillStyle = "rgba(255, 255, 255, 0.50)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(12, 12, 195, 68, 10);
    else ctx.rect(12, 12, 195, 68);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#1a4a28";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Hauteur : " + this.score + " m", 22, 42);

    ctx.fillStyle = "#333";
    ctx.font = "18px Arial";
    ctx.fillText("Record : " + this.meilleurScore + " m", 22, 70);

    if (!this.joueur.attache) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Clic ou Espace pour s'accrocher !", this.canvas.width / 2, this.canvas.height - 28);
    }

    ctx.restore();
  }

  drawMenu() {
    this.drawFond();

    let ctx = this.ctx;
    let W = this.canvas.width;
    let H = this.canvas.height;
    ctx.save();

    let pw = Math.min(500, W - 40);
    let ph = 260;
    let px = (W - pw) / 2;
    let py = H / 2 - ph / 2 - 20;

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, 18);
    else ctx.rect(px, py, pw, ph);
    ctx.fill();

    ctx.shadowBlur = 3;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.fillStyle = "#0e3020";
    ctx.font = "bold 62px Arial";
    ctx.textAlign = "center";
    ctx.fillText("STICKY CLIMBER", W / 2, py + 80);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(30,30,30,0.4)";
    ctx.fillRect(W / 2 - 180, py + 96, 360, 2);

    ctx.fillStyle = "#111";
    ctx.font = "25px Arial";
    ctx.fillText("Clic ou Espace pour jouer", W / 2, py + 142);

    ctx.fillStyle = "rgba(50,50,50,0.7)";
    ctx.font = "16px Arial";
    ctx.fillText("Lancer · en vol : s'accrocher", W / 2, py + 178);

    ctx.fillStyle = "#1a5e30";
    ctx.font = "bold 20px Arial";
    ctx.fillText("Record : " + this.meilleurScore + " m", W / 2, py + 218);

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
