import ObjetGraphique from "./objetGraphique.js";

/**
 * Classe Explosion
 */
export default class Explosion extends ObjetGraphique {
  constructor(x, y, couleur, rayonMax) {
    super(x, y, couleur, 0, 0);

    this.rayon = 0;
    this.rayonMax = rayonMax;
    this.vitesseCroissance = 2;

    // Phases : CROISSANCE -> STABLE -> DISPARITION
    this.phase = "CROISSANCE";
    this.tempsStable = 60;
    this.compteurStable = 0;

    this.terminee = false;
  }

  /**
   * Dessin de l'explosion
   */
  draw(ctx) {
    if (this.terminee) return;

    ctx.save();

    // Positionnement relatif
    ctx.translate(this.x, this.y);

    // Effet glow néon intense
    ctx.shadowBlur = 30;
    ctx.shadowColor = this.couleur;

    // Cercle semi-transparent
    ctx.globalAlpha = this.phase === "DISPARITION" ? 0.3 : 0.6;
    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon, 0, 2 * Math.PI);
    ctx.fill();

    // Contour plus brillant
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.couleur;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Mise à jour de l'explosion
   */
  update() {
    if (this.terminee) return;

    if (this.phase === "CROISSANCE") {
      this.rayon += this.vitesseCroissance;
      if (this.rayon >= this.rayonMax) {
        this.rayon = this.rayonMax;
        this.phase = "STABLE";
      }
    } else if (this.phase === "STABLE") {
      this.compteurStable++;
      if (this.compteurStable >= this.tempsStable) {
        this.phase = "DISPARITION";
      }
    } else if (this.phase === "DISPARITION") {
      this.rayon -= this.vitesseCroissance * 2;
      if (this.rayon <= 0) {
        this.rayon = 0;
        this.terminee = true;
      }
    }
  }

  /**
   * Vérificationd de l'explosion
   */
  estActive() {
    return (
      !this.terminee && (this.phase === "CROISSANCE" || this.phase === "STABLE")
    );
  }
}
