/**
 * Initialise les écouteurs d'événements pour le jeu.
 * @param {Game} game - L'instance du jeu
 */
export function initListeners(game) {
  console.log("Initialisation des écouteurs...");

  // redimensionnement
  window.addEventListener("resize", () => {
    game.resizeCanvas();
  });

  // clics
  game.canvas.addEventListener("click", (e) => {
    game.handleClick(e);
  });
}
