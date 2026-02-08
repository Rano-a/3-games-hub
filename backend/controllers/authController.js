const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic Validation
    if (!username || !password) {
      return res.status(400).json({ msg: "Veuillez remplir tous les champs." });
    }
    if (password.length < 4) {
      return res
        .status(400)
        .json({ msg: "Le mot de passe doit faire au moins 4 caractères." });
    }

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: "Ce pseudo est déjà pris." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
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

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Pseudo incorrect." });
    }

    // Check password (bcrypt comparison)
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
