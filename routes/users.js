const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const getUserServerAddresses = require("../controllers/userController");
const { authenticateUser } = require("../controllers/authController");

router.route("/auth-token").post(authMiddleware.verifyToken, authenticateUser);

router
  .route("/:userId/server-addresses")
  .get(authMiddleware.verifyToken, getUserServerAddresses);

module.exports = router;
