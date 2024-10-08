const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fid: { type: Number, required: true },
  signerKey: { type: String, required: false }, // TODO: Encrypt this field
});

const User = mongoose.model("User", userSchema);

module.exports = User;
