const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { getPendingRequests } = require("../controllers/adminUser");

router.route("/server-addresses/requests").get(verifyToken, getPendingRequests);

module.exports = router;
