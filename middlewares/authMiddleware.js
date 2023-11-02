const admin = require("firebase-admin");
const User = require("../models/User");

const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ email, name });
      await user.save();

      return res.status(201).json({
        status: "Creation success",
        message: "Your information has been added successfully.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return res.status(200).json({
      status: "Sign in success",
      message: "Welcome back!",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error.code === "auth/invalid-argument") {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid token provided." });
    }

    if (error.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ status: "error", message: "Token has expired." });
    }

    if (error.code === "auth/id-token-revoked") {
      return res
        .status(401)
        .json({ status: "error", message: "Token has been revoked." });
    }

    res.status(500).json({
      status: "error",
      message: "Server encountered an error processing the request.",
    });
  }
};

module.exports = verifyToken;
