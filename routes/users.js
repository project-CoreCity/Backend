const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.route("/auth-token").post(authMiddleware);

module.exports = router;
