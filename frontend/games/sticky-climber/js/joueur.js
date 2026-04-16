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
    let r  = this.rayon;

    ctx.save();

    // Fil
    if (this.attache && this.ancre) {
      let ancreScreenY = this.ancre.y - offsetY;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(40, 150, 80, 0.75)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(this.x, sy);
      ctx.lineTo(this.ancre.x, ancreScreenY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.translate(this.x, sy);

    // Ombre portée
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(20, 120, 50, 0.45)";

    // Corps slime — blob aplati avec bezier
    let grad = ctx.createRadialGradient(-r * 0.3, -r * 0.4, 0, r * 0.1, r * 0.1, r * 1.5);
    grad.addColorStop(0,   "rgba(175, 255, 190, 0.97)");
    grad.addColorStop(0.4, "rgba(55,  200,  90, 0.93)");
    grad.addColorStop(1,   "rgba(15,  110,  45, 0.88)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.bezierCurveTo( r * 0.55, -r * 1.1,  r * 1.4,  -r * 0.45,  r * 1.35,  r * 0.25);
    ctx.bezierCurveTo( r * 1.3,   r * 0.88,  r * 0.65,  r,          0,          r);
    ctx.bezierCurveTo(-r * 0.65,  r,         -r * 1.3,   r * 0.88, -r * 1.35,  r * 0.25);
    ctx.bezierCurveTo(-r * 1.4,  -r * 0.45, -r * 0.55, -r * 1.1,   0,         -r * 0.9);
    ctx.closePath();
    ctx.fill();

    // Contour subtil
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(10, 80, 30, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Yeux
    ctx.fillStyle = "#162810";
    ctx.beginPath();
    ctx.ellipse(-r * 0.38, -r * 0.12, r * 0.24, r * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse( r * 0.38, -r * 0.12, r * 0.24, r * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reflets dans les yeux
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.beginPath();
    ctx.arc(-r * 0.30, -r * 0.24, r * 0.09, 0, Math.PI * 2);
    ctx.arc( r * 0.46, -r * 0.24, r * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // Reflet brillant sur le dessus
    ctx.fillStyle = "rgba(255, 255, 255, 0.48)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.18, -r * 0.55, r * 0.40, r * 0.17, -0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
