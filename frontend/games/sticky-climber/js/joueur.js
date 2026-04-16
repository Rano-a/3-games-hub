const GRAVITE = 0.2;
const VITESSE_ANGULAIRE = 0.07;
const LONGUEUR_FIL_MAX = 130;

export default class Joueur {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rayon = 14;

    this.attache = false;
    this.ancre = null;
    this.angle = 0;
    this.vitesseAngulaire = VITESSE_ANGULAIRE;
    this.longueurFil = LONGUEUR_FIL_MAX;
  }

  attacherA(ancre) {
    let dx = this.x - ancre.x;
    let dy = this.y - ancre.y;
    this.longueurFil = Math.min(Math.sqrt(dx * dx + dy * dy), LONGUEUR_FIL_MAX);
    this.angle = Math.atan2(dy, dx);

    // Conserver le sens de rotation cohérent avec la vitesse actuelle
    let tangX = -Math.sin(this.angle);
    let tangY = Math.cos(this.angle);
    let dot = this.vx * tangX + this.vy * tangY;
    this.vitesseAngulaire = dot >= 0 ? VITESSE_ANGULAIRE : -VITESSE_ANGULAIRE;

    this.ancre = ancre;
    this.attache = true;
  }

  detacher() {
    this.vx = -Math.sin(this.angle) * this.longueurFil * this.vitesseAngulaire;
    this.vy = Math.cos(this.angle) * this.longueurFil * this.vitesseAngulaire;
    this.attache = false;
    this.ancre = null;
  }

  update(largeur) {
    if (this.attache && this.ancre) {
      this.angle += this.vitesseAngulaire;
      this.x = this.ancre.x + Math.cos(this.angle) * this.longueurFil;
      this.y = this.ancre.y + Math.sin(this.angle) * this.longueurFil;
    } else {
      this.vy += GRAVITE;
      this.x += this.vx;
      this.y += this.vy;

      // Rebond sur les bords latéraux
      if (this.x < this.rayon) {
        this.x = this.rayon;
        this.vx = Math.abs(this.vx) * 0.7;
      }
      if (this.x > largeur - this.rayon) {
        this.x = largeur - this.rayon;
        this.vx = -Math.abs(this.vx) * 0.7;
      }
    }
  }

  draw(ctx, offsetY) {
    let sy = this.y - offsetY;

    ctx.save();

    // Fil
    if (this.attache && this.ancre) {
      let ancreScreenY = this.ancre.y - offsetY;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, sy);
      ctx.lineTo(this.ancre.x, ancreScreenY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.translate(this.x, sy);

    // Halo de glow
    ctx.shadowBlur = 28;
    ctx.shadowColor = "#ffd700";

    let grad = ctx.createRadialGradient(-4, -4, 1, 0, 0, this.rayon);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.35, "#ffd700");
    grad.addColorStop(1, "#b8860b");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon, 0, Math.PI * 2);
    ctx.fill();

    // Anneau
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Yeux
    ctx.fillStyle = "#1a0a00";
    ctx.beginPath();
    ctx.arc(-4, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Reflet
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(-this.rayon * 0.3, -this.rayon * 0.3, this.rayon * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
