const admin = require("firebase-admin");
const User = require("../models/User");

module.exports.verifyToken = async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.body.token;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name, uid });
      await user.save();
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.code === "auth/invalid-argument") {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid token provided." });
    }

    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ status: "Error", message: "Token has expired." });
    }

    if (error.code === "auth/id-token-revoked") {
      return res
        .status(401)
        .json({ status: "Error", message: "Token has been revoked." });
    }

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};
