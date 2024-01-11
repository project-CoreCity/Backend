const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { authenticateUser } = require("../controllers/auth");
const {
  getUserServerAddresses,
  registerServerAddress,
  getUserInformation,
} = require("../controllers/user");

router.route("/auth-token").post(verifyToken, authenticateUser);

router.route("/").get(verifyToken, getUserInformation);

router
  .route("/:userId/server-addresses")
  .get(verifyToken, getUserServerAddresses)
  .post(verifyToken, registerServerAddress);

module.exports = router;
