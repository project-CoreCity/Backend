const mongoose = require("mongoose");

const serverAddressSchema = new mongoose.Schema({
  address: { type: String, unique: true },
});

module.exports = mongoose.model("ServerAddress", serverAddressSchema);
