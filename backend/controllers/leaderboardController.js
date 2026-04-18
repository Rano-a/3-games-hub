const User = require("../models/User");

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, "username gameScores globalScore")
      .sort({ globalScore: -1 })
      .lean();

    const leaderboard = users.map((u) => {
      const gs = u.gameScores instanceof Map ? u.gameScores : new Map(Object.entries(u.gameScores || {}));
      return {
        username: u.username,
        globalScore: u.globalScore || 0,
        scores: {
          emperor: gs.get("emperor") || 0,
          neon:    gs.get("neon")    || 0,
          sticky:  gs.get("sticky")  || 0,
        },
      };
    });

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateScore = async (req, res) => {
  try {
    const { username, game, score } = req.body;

    if (!username || !game || score === undefined) {
      return res.status(400).json({ msg: "Données manquantes." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ msg: "Utilisateur introuvable." });
    }

    const current = user.gameScores.get(game) || 0;
    if (score > current) {
      user.gameScores.set(game, score);
      user.markModified("gameScores");
      let global = 0;
      user.gameScores.forEach((v) => (global += v));
      user.globalScore = global;
      await user.save();
    }

    res.json({ msg: "Score mis à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
