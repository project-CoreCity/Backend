const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const {
  getApprovalRequestServerList,
  getApprovalRequestUserList,
  updateRequestApprovalStatus,
  deleteApprovalRequest,
} = require("../controllers/adminUser");

router
  .route("/server-addresses/requests")
  .get(verifyToken, getApprovalRequestServerList);

router
  .route("/server-addresses/:addressId/users/requests")
  .get(verifyToken, getApprovalRequestUserList);

router
  .route("/server-addresses/:addressId/requests/:userId")
  .patch(verifyToken, updateRequestApprovalStatus)
  .delete(verifyToken, deleteApprovalRequest);

module.exports = router;
