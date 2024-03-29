const admin = require("firebase-admin");
const User = require("../models/User");

module.exports.socketAuth = async (socket, next) => {
  const token = socket.handshake.query.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email } = decodedToken;

    let user = await User.findOne({ email });

    socket.user = user;

    next();
  } catch (error) {
    console.error(error);

    return next(new Error("Authentication error"));
  }
};
