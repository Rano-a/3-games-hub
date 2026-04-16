export function initListeners(game) {
  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (game.etat === "MENU" || game.etat === "GAME OVER") {
        game.demarrer();
      }
      return;
    }
    if (game.etat !== "JEU EN COURS") return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      game.joueur.allerGauche();
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      game.joueur.allerDroite();
    }
  });

  document.getElementById("btn-demarrer").addEventListener("click", () => {
    game.demarrer();
  });

  document.getElementById("btn-rejouer").addEventListener("click", () => {
    game.demarrer();
  });

  let touchDebutX = null;

  window.addEventListener("touchstart", (e) => {
    touchDebutX = e.touches[0].clientX;
  });

  window.addEventListener("touchend", (e) => {
    if (touchDebutX === null || game.etat !== "JEU EN COURS") return;
    let dx = e.changedTouches[0].clientX - touchDebutX;
    if (Math.abs(dx) > 30) {
      if (dx < 0) game.joueur.allerGauche();
      else game.joueur.allerDroite();
    }
    touchDebutX = null;
  });
}
