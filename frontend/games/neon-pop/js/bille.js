import ObjetGraphique from "./objetGraphique.js";

/**
 * Classe Bille
 */
export default class Bille extends ObjetGraphique {
  constructor(x, y, couleur, rayon) {
    super(x, y, couleur, rayon * 2, rayon * 2);

    this.rayon = rayon;

    this.speedX = Math.random() * 2.4 - 1.2;
    this.speedY = Math.random() * 2.4 - 1.2;

    this.explosee = false;
  }

  /**
   * Dessin de la bille
   */
  draw(ctx) {
    if (this.explosee) return;

    ctx.save();

    // Effet glow néon
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.couleur;

    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.rayon, 0, 2 * Math.PI);
    ctx.fill();

    // Petit reflet blanc au centre
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(
      this.x - this.rayon * 0.3,
      this.y - this.rayon * 0.3,
      this.rayon * 0.2,
      0,
      2 * Math.PI,
    );
    ctx.fill();

    ctx.restore();
  }

  /**
   * Déplace la bille et gère les rebonds sur les bords.
   */
  move(largeurCanvas, hauteurCanvas) {
    if (this.explosee) return;

    // Rebond sur les bords horizontaux
    if (this.x + this.rayon > largeurCanvas) {
      this.x = largeurCanvas - this.rayon;
      this.speedX = -this.speedX;
    }
    if (this.x - this.rayon < 0) {
      this.x = this.rayon;
      this.speedX = -this.speedX;
    }

    // Rebond sur les bords verticaux
    if (this.y + this.rayon > hauteurCanvas) {
      this.y = hauteurCanvas - this.rayon;
      this.speedY = -this.speedY;
    }
    if (this.y - this.rayon < 0) {
      this.y = this.rayon;
      this.speedY = -this.speedY;
    }

    // Déplacement
    super.move(this.speedX, this.speedY);
  }

  /**
   * Explosion de la bille
   */
  exploser() {
    this.explosee = true;
  }
}
