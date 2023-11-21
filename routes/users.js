const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getUserServerAddresses,
  registerServerAddress,
  getUserInformation,
} = require("../controllers/userController");
const { authenticateUser } = require("../controllers/authController");

router.route("/auth-token").post(authMiddleware.verifyToken, authenticateUser);

router.route("/:uid").get(authMiddleware.verifyToken, getUserInformation);

router
  .route("/:userId/server-addresses")
  .get(authMiddleware.verifyToken, getUserServerAddresses)
  .post(authMiddleware.verifyToken, registerServerAddress);

module.exports = router;
