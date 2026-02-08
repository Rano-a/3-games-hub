const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "default-avatar.png",
  },
  gameScores: {
    type: Map,
    of: Number,
    default: {},
  },
  globalScore: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", UserSchema);
