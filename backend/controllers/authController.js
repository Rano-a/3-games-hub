const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation de base
    if (!username || !password) {
      return res.status(400).json({ msg: "Veuillez remplir tous les champs." });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ msg: "Le mot de passe doit faire au moins 4 caractères." });
    }

    // Vérifier si l'utilisateur existe
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: "Ce pseudo est déjà pris." });
    }

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer un nouvel utilisateur
    user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      msg: "Utilisateur créé avec succès",
      user: {
        username: user.username,
        avatar: user.avatar,
        globalScore: user.globalScore,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// @desc    Authentifier l'utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier l'utilisateur
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Pseudo incorrect." });
    }

    // Vérifier le mot de passe (comparaison bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Mot de passe incorrect." });
    }

    res.json({
      msg: "Connexion réussie",
      user: {
        username: user.username,
        avatar: user.avatar,
        globalScore: user.globalScore,
        gameScores: user.gameScores,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
