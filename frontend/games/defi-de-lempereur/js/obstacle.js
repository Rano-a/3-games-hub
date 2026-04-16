const CENTRES_VOIES = [60, 180, 300];
const LARGEUR_OBSTACLE = 80;

export default class Obstacle {
  constructor(voie, dureeAnimation, piste) {
    this.voie = voie;
    this.terminee = false;

    this.el = document.createElement("div");
    this.el.className = "obstacle";
    this.el.style.left = CENTRES_VOIES[voie] - LARGEUR_OBSTACLE / 2 + "px";
    this.el.style.animation = `tomberObstacle ${dureeAnimation}ms linear forwards`;

    piste.appendChild(this.el);

    this.el.addEventListener("animationend", () => {
      this.terminee = true;
      this.el.remove();
    });
  }

  detruire() {
    this.terminee = true;
    this.el.remove();
  }
}
