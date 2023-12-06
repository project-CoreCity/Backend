const mongoose = require("mongoose");

const userServerRelationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "ServerAddress" },
  isApproved: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  registrationDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserServerRelation", userServerRelationSchema);
