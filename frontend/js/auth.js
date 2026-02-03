document.addEventListener("DOMContentLoaded", () => {
  // Elements
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

  // State
  const USERS_KEY = "game_hub_users";
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

  // Modal Logic
  function openModal() {
    authOverlay.classList.add("active");
    // Reset forms when opening
    loginFormContainer.style.display = "block";
    registerFormContainer.style.display = "none";
    clearErrors();
  }

  function closeModal() {
    authOverlay.classList.remove("active");
  }

  // Dropdown Logic
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

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-block")) {
      profileDropdown.classList.remove("active");
    }
  });

  menuLogout.addEventListener("click", () => {
    logout();
    profileDropdown.classList.remove("active");
  });

  authBtn.addEventListener("click", handleAuthClick);

  authCloseBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && authOverlay.classList.contains("active")) {
      closeModal();
    }
  });

  // Toggle Forms
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

  // Auth Logic

  function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  }

  function saveUser(username, password) {
    const users = getUsers();
    if (users[username]) {
      return false;
    }
    users[username] = { password: password };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }

  function checkCredentials(username, password) {
    const users = getUsers();
    return users[username] && users[username].password === password;
  }

  function setSession(username) {
    localStorage.setItem(SESSION_KEY, username);
    updateUI(username);
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    updateUI(null);
    updateUI(null);
  }

  function updateUI(username) {
    if (username) {
      userDisplayName.textContent = username;
    } else {
      userDisplayName.textContent = "Default User";
    }
  }

  // Form Submissions

  // LOGIN
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const errorDiv = document.getElementById("login-error");

    if (!checkCredentials(username, password)) {
      errorDiv.textContent = "Pseudo ou mot de passe incorrect.";
      return;
    }

    setSession(username);
    closeModal();
  });

  // REGISTER
  formRegister.addEventListener("submit", (e) => {
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

    if (!saveUser(username, password)) {
      errorDiv.textContent = "Ce pseudo est déjà pris.";
      return;
    }

    // Auto login after register
    setSession(username);
    closeModal();
    alert("Compte créé avec succès ! Bienvenue.");
  });

  // Init
  const savedUser = getSession();
  if (savedUser) {
    updateUI(savedUser);
  }
});
