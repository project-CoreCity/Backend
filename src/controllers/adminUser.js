const User = require("../models/User");
const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");

const getPendingRequests = async (req, res) => {
  const addressIds = req.query.id;

  try {
    const requestPromises = addressIds.map((addressId) =>
      UserServerRelation.find({ addressId, isApproved: false }).lean(),
    );
    const addressPromises = addressIds.map((addressId) =>
      ServerAddress.findById(addressId).lean(),
    );

    const requestResults = await Promise.all(requestPromises);
    const addressResults = await Promise.all(addressPromises);

    const combinedResults = requestResults.map((request, index) => ({
      requests: request,
      address: addressResults[index].address,
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

const getAccessRequestUserList = async (req, res) => {
  const uid = req.user.uid;
  const serverAddress = req.query.address;
  const userIds = Array.isArray(req.query.userId)
    ? req.query.userId
    : [req.query.userId];

  if (!userIds.length) {
    return res.status(200).json({ userList: [] });
  }

  try {
    const userInfo = await User.findOne({ uid });

    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    const serverInfo = await ServerAddress.findOne({ address: serverAddress });

    if (!serverInfo) {
      return res.status(404).json({ message: "Server address not found" });
    }

    const requestTarget = await UserServerRelation.findOne({
      userId: userInfo._id,
      addressId: serverInfo._id,
    });

    if (!requestTarget || !requestTarget.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const requestUserPromises = userIds.map((userId) =>
      User.findOne({ _id: userId }),
    );

    const requestUserResults = await Promise.all(requestUserPromises);

    const requestUsersNameList = requestUserResults.map((user) => ({
      name: user.name,
    }));

    res.status(200).json({
      userList: requestUsersNameList,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

module.exports = {
  getPendingRequests,
  getAccessRequestUserList,
};
