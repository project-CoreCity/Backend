const User = require("../models/User");
const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");

const getApprovalRequestServerList = async (req, res) => {
  const addressIds = Array.isArray(req.query.id)
    ? req.query.id
    : [req.query.id];

  try {
    const approvalRequestPromises = await addressIds.map((addressId) =>
      UserServerRelation.find({ addressId, isApproved: false }).lean(),
    );

    const approvalRequestResults = await Promise.all(approvalRequestPromises);

    const addressInfoPromises = await addressIds.map((addressId) =>
      ServerAddress.findById(addressId).lean(),
    );

    const addressInfoResults = await Promise.all(addressInfoPromises);

    if (addressInfoResults.some((result) => !result)) {
      return res.status(404).json({
        status: "Error",
        message: "One or more server addresses not found.",
      });
    }

    const combinedResults = approvalRequestResults.map((request, index) => ({
      requestList: request,
      addressId: addressInfoResults[index]._id,
      address: addressInfoResults[index].address,
    }));

    res.status(200).json({
      data: combinedResults,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

const getApprovalRequestUserList = async (req, res) => {
  const adminUserUid = req.user.uid;
  const serverAddressId = req.params.addressId;
  const requestUserIds = Array.isArray(req.query.userId)
    ? req.query.userId
    : [req.query.userId];

  if (!requestUserIds.length) {
    return res.status(200).json({ userList: [] });
  }

  try {
    const adminUserInfo = await User.findOne({ uid: adminUserUid });

    if (!adminUserInfo) {
      return res
        .status(404)
        .json({ status: "Error", message: "User not found." });
    }

    const serverInfo = await ServerAddress.findOne({ _id: serverAddressId });

    if (!serverInfo) {
      return res
        .status(404)
        .json({ status: "Error", message: "Server address not found." });
    }

    const approvalRequestTarget = await UserServerRelation.findOne({
      userId: adminUserInfo._id,
      addressId: serverInfo._id,
    });

    if (!approvalRequestTarget || !approvalRequestTarget.isAdmin) {
      return res
        .status(403)
        .json({ status: "Error", message: "Access denied." });
    }

    const requestUserPromises = await requestUserIds.map((userId) =>
      User.findOne({ _id: userId }),
    );

    const requestUserResults = await Promise.all(requestUserPromises);

    if (requestUserResults.some((user) => !user)) {
      return res.status(404).json({
        status: "Error",
        message: "One or more users not found.",
      });
    }

    const requestUsersNameList = requestUserResults
      .filter((user) => user != null)
      .map((user) => ({
        name: user.name,
        id: user._id,
        addressId: serverInfo._id,
      }));

    res.status(200).json({
      data: requestUsersNameList,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

const updateRequestApprovalStatus = async (req, res) => {
  const adminUserUid = req.user.uid;
  const requestUserId = req.params.userId;
  const targetServerAddressId = req.params.addressId;
  const isApproved = req.body.isApproved;

  try {
    const adminUserInfo = await User.findOne({ uid: adminUserUid });

    if (!adminUserInfo) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetServerAddressInfo = await ServerAddress.findOne({
      _id: targetServerAddressId,
    });

    if (!targetServerAddressInfo) {
      return res.status(404).json({ message: "Server address not found." });
    }

    const adminUserDoc = await UserServerRelation.findOne({
      userId: adminUserInfo._id,
      addressId: targetServerAddressId,
    });

    if (!adminUserDoc || !adminUserDoc.isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const requestUserDoc = await UserServerRelation.findOne({
      userId: requestUserId,
      isApproved: false,
      addressId: targetServerAddressId,
    });

    if (requestUserDoc) {
      await UserServerRelation.findByIdAndUpdate(requestUserDoc._id, {
        isApproved: isApproved,
      });

      return res.status(200).json({
        status: "Success",
        message: "User document has been updated.",
      });
    }

    return res.status(404).json({
      status: "Error",
      message: "Request user not found or already approved.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

const deleteApprovalRequest = async (req, res) => {
  const adminUserUid = req.user.uid;
  const requestUserId = req.params.userId;
  const targetServerAddressId = req.params.addressId;

  try {
    const adminUserInfo = await User.findOne({ uid: adminUserUid });

    if (!adminUserInfo) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetServerAddressInfo = await ServerAddress.findOne({
      _id: targetServerAddressId,
    });

    if (!targetServerAddressInfo) {
      return res.status(404).json({ message: "Server address not found." });
    }

    const adminUserDoc = await UserServerRelation.findOne({
      userId: adminUserInfo._id,
      addressId: targetServerAddressId,
    });

    if (!adminUserDoc || !adminUserDoc.isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const requestUserDoc = await UserServerRelation.findOne({
      userId: requestUserId,
      isApproved: false,
      addressId: targetServerAddressId,
    });

    if (requestUserDoc) {
      await UserServerRelation.deleteOne({
        userId: requestUserId,
        addressId: targetServerAddressId,
      });

      return res.status(200).json({
        status: "Success",
        message: "Request has been successfully deleted.",
      });
    }

    return res.status(404).json({
      status: "Error",
      message: "Request user not found or already deleted.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

module.exports = {
  getApprovalRequestServerList,
  getApprovalRequestUserList,
  updateRequestApprovalStatus,
  deleteApprovalRequest,
};
