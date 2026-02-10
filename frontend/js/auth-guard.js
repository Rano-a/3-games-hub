(function () {
  const SESSION_KEY = "game_hub_session";
  if (!localStorage.getItem(SESSION_KEY)) {
    window.location.href = "/";
  }
})();
