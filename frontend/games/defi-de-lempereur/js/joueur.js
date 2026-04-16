const CENTRES_VOIES = [60, 180, 300];
const LARGEUR_JOUEUR = 60;
const DUREE_INVINCIBILITE = 2000;

export default class Joueur {
  constructor(piste) {
    this.piste = piste;
    this.voie = 1;
    this.invincible = false;
    this.tempsInvincible = 0;

    this.el = document.createElement("div");
    this.el.id = "joueurEl";
    this.piste.appendChild(this.el);
    this.positionner();
  }

  positionner() {
    this.el.style.left = CENTRES_VOIES[this.voie] - LARGEUR_JOUEUR / 2 + "px";
  }

  allerGauche() {
    if (this.voie > 0) {
      this.voie--;
      this.positionner();
    }
  }

  allerDroite() {
    if (this.voie < 2) {
      this.voie++;
      this.positionner();
    }
  }

  flashInvincible() {
    this.invincible = true;
    this.tempsInvincible = 0;
    this.el.classList.add("flash");
  }

  mettreAJourInvincibilite(delta) {
    if (!this.invincible) return;
    this.tempsInvincible += delta;
    if (this.tempsInvincible >= DUREE_INVINCIBILITE) {
      this.invincible = false;
      this.el.classList.remove("flash");
    }
  }

  detruire() {
    this.el.remove();
  }
}
