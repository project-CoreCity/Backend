const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
  getPendingRequests,
  getAccessRequestUserList,
} = require("../controllers/adminUser");

router.route("/server-addresses/requests").get(verifyToken, getPendingRequests);

router.route("/users").get(verifyToken, getAccessRequestUserList);

module.exports = router;
