const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  refreshToken: [String],
});

const user = mongoose.model("User", userSchema);

module.exports = user;
