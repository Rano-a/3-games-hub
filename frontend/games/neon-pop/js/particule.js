import ObjetGraphique from "./objetGraphique.js";

/**
 * Classe Particule
 */
export default class Particule extends ObjetGraphique {
  constructor(x, y, couleur) {
    super(x, y, couleur, 4, 4);

    this.rayon = 2 + Math.random() * 3;

    // Direction aléatoire
    let angle = Math.random() * Math.PI * 2;
    let vitesse = 2 + Math.random() * 4;
    this.speedX = Math.cos(angle) * vitesse;
    this.speedY = Math.sin(angle) * vitesse;

    // Durée de vie
    this.dureeVie = 30 + Math.random() * 20;
    this.age = 0;

    this.terminee = false;
  }

  /**
   * Dessin de la particule
   */
  draw(ctx) {
    if (this.terminee) return;

    ctx.save();

    // Positionnement relatif
    ctx.translate(this.x, this.y);

    // Transparence
    let alpha = 1 - this.age / this.dureeVie;
    ctx.globalAlpha = alpha;

    // Effet glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.couleur;

    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.arc(0, 0, this.rayon * alpha, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Mise à jour de la particule
   */
  update() {
    if (this.terminee) return;

    // Déplacement
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= 0.95;
    this.speedY *= 0.95;

    // Vieillissement
    this.age++;
    if (this.age >= this.dureeVie) {
      this.terminee = true;
    }
  }
}

/**
 * Création d'un groupe de particules
 */
export function creerParticules(x, y, couleur, nombre) {
  let particules = [];
  for (let i = 0; i < nombre; i++) {
    particules.push(new Particule(x, y, couleur));
  }
  return particules;
}
