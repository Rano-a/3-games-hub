document.addEventListener("DOMContentLoaded", () => {
  // Éléments
  const authOverlay = document.getElementById("auth-overlay");
  const authBtn = document.getElementById("auth-btn");
  const authCloseBtn = document.getElementById("auth-close");

  const loginFormContainer = document.getElementById("login-form");
  const registerFormContainer = document.getElementById("register-form");

  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");

  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  const userDisplayName = document.getElementById("user-display-name");

  // État
  const SESSION_KEY = "game_hub_session";

  // Validations
  function validateUsername(username) {
    if (username.length < 3)
      return "Le pseudo doit faire au moins 3 caractères.";
    return null;
  }

  function validatePassword(password) {
    if (password.length < 4)
      return "Le mot de passe doit faire au moins 4 caractères.";
    return null;
  }

  // Modal
  function openModal() {
    authOverlay.classList.add("active");
    // Réinitialiser les formulaires à l'ouverture
    loginFormContainer.style.display = "block";
    registerFormContainer.style.display = "none";
    clearErrors();
  }

  function closeModal() {
    authOverlay.classList.remove("active");
  }

  // Menu Déroulant
  const profileDropdown = document.getElementById("profile-dropdown");
  const menuLogout = document.getElementById("menu-logout");
  const menuProfile = document.getElementById("menu-profile");

  function toggleDropdown() {
    profileDropdown.classList.toggle("active");
  }

  function handleAuthClick(e) {
    if (e) e.preventDefault();
    const currentUser = getSession();
    if (currentUser) {
      toggleDropdown();
    } else {
      openModal();
    }
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-block")) {
      profileDropdown.classList.remove("active");
    }
  });

  menuLogout.addEventListener("click", () => {
    logout();
    profileDropdown.classList.remove("active");
  });

  // Profil
  const profileOverlay = document.getElementById("profile-overlay");
  const profileCloseBtn = document.getElementById("profile-close");
  const profileUsernameEl = document.getElementById("profile-username");

  function openProfileModal() {
    const currentUser = getSession();
    if (currentUser) {
      profileUsernameEl.textContent = currentUser;
    } else {
      profileUsernameEl.textContent = "Default User";
    }

    // Remplir les scores à partir du tableau games
    document.getElementById("score-empereur").textContent = games[0].score || 0;
    document.getElementById("score-neon").textContent = games[1].score || 0;
    document.getElementById("score-sticky").textContent = games[2].score || 0;

    // Calculer le score global
    const globalScore = games.reduce((sum, game) => sum + (game.score || 0), 0);
    document.getElementById("score-global").textContent = globalScore;

    profileOverlay.classList.add("active");
    profileDropdown.classList.remove("active");
  }

  function closeProfileModal() {
    profileOverlay.classList.remove("active");
  }

  menuProfile.addEventListener("click", openProfileModal);

  profileCloseBtn.addEventListener("click", closeProfileModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && profileOverlay.classList.contains("active")) {
      closeProfileModal();
    }
  });

  profileOverlay.addEventListener("click", (e) => {
    if (e.target === profileOverlay) {
      closeProfileModal();
    }
  });

  authBtn.addEventListener("click", handleAuthClick);

  authCloseBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authOverlay.classList.contains("active")) {
      closeModal();
    }
  });

  // Basculer entre les formulaires
  showRegisterLink.addEventListener("click", () => {
    loginFormContainer.style.display = "none";
    registerFormContainer.style.display = "block";
    clearErrors();
  });

  showLoginLink.addEventListener("click", () => {
    registerFormContainer.style.display = "none";
    loginFormContainer.style.display = "block";
    clearErrors();
  });

  function clearErrors() {
    document.getElementById("login-error").textContent = "";
    document.getElementById("register-error").textContent = "";
    document.getElementById("form-login").reset();
    document.getElementById("form-register").reset();
  }

  // Authentification (API)

  async function registerUser(username, password) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Erreur lors de l'inscription");
      }
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  async function loginUser(username, password) {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Erreur lors de la connexion");
      }
      return data.user;
    } catch (error) {
      throw error;
    }
  }

  function setSession(username) {
    sessionStorage.setItem(SESSION_KEY, username);
    updateUI(username);
  }

  function getSession() {
    return sessionStorage.getItem(SESSION_KEY);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    updateUI(null);
  }

  function updateUI(username) {
    if (username) {
      userDisplayName.textContent = username;
    } else {
      userDisplayName.textContent = "Default User";
    }
  }

  // Formulaires

  // CONNEXION
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorDiv = document.getElementById("login-error");

    try {
      await loginUser(username, password);
      setSession(username);
      closeModal();
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  });

  // INSCRIPTION
  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document
      .getElementById("register-confirm-password")
      .value.trim();
    const errorDiv = document.getElementById("register-error");

    const userError = validateUsername(username);
    if (userError) {
      errorDiv.textContent = userError;
      return;
    }

    const passError = validatePassword(password);
    if (passError) {
      errorDiv.textContent = passError;
      return;
    }

    if (password !== confirmPassword) {
      errorDiv.textContent = "Les mots de passe ne correspondent pas.";
      return;
    }

    try {
      await registerUser(username, password);
      setSession(username);
      closeModal();
    } catch (error) {
      errorDiv.textContent = error.message;
    }
  });

  // Initialisation
  const savedUser = getSession();
  if (savedUser) {
    updateUI(savedUser);
  }
});
