/**
 * Classe de base pour tous les objets graphiques du jeu.
 */
export default class ObjetGraphique {
  x = 0;
  y = 0;
  couleur = "white";
  largeur = 10;
  hauteur = 10;

  constructor(x, y, couleur, largeur, hauteur) {
    this.x = x;
    this.y = y;
    this.couleur = couleur;
    this.largeur = largeur;
    this.hauteur = hauteur;
  }

  /**
   * Dessin de l'objet sur le canvas
   */
  draw(ctx) {
    ctx.save();

    ctx.fillStyle = this.couleur;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.largeur / 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Déplacement de l'objet de dx, dy
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * Déplacement de l'objet à une position absolue
   */
  moveAbsolute(x, y) {
    this.x = x;
    this.y = y;
  }
}
