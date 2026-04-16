export function initListeners(game) {
  window.addEventListener("resize", () => game.resizeCanvas());

  game.canvas.addEventListener("click", (e) => game.handleClick(e));

  window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      game.handleClick();
    }
  });

  game.canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    game.handleClick(e.touches[0]);
  }, { passive: false });
}
