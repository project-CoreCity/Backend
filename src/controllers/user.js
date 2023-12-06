const mongoose = require("mongoose");
const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");
const User = require("../models/User");

const getUserInformation = async (req, res) => {
  try {
    const uid = req.params.uid;
    const userInfo = await User.findOne({ uid });

    if (!userInfo) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    res.status(200).json(userInfo);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

const getUserServerAddresses = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid user ID." });
    }

    const relation = await UserServerRelation.find({ userId })
      .populate("addressId")
      .exec();

    const serverAddresses = relation.map((relation) => {
      return {
        id: relation.addressId._id,
        address: relation.addressId.address,
        isApproved: relation.isApproved,
        isAdmin: relation.isAdmin,
      };
    });

    res.status(200).json(serverAddresses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      message: "Server encountered an error processing the request.",
    });
  }
};

const registerServerAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { serverAddress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ status: "Error", message: "Invalid user ID." });
    }

    let address = await ServerAddress.findOne({ address: serverAddress });
    let isNewAddress = false;

    if (!address) {
      address = new ServerAddress({ address: serverAddress });
      await address.save();
      isNewAddress = true;
    }

    const existingRelation = await UserServerRelation.findOne({
      userId,
      addressId: address._id,
    });

    if (existingRelation && existingRelation.isAdmin) {
      return res.status(400).json({
        status: "Error",
        message: "You are already the administrator of this server address.",
      });
    }

    if (existingRelation) {
      return res.status(400).json({
        status: "Error",
        message: "You have already registered this server address.",
      });
    }

    const relation = new UserServerRelation({
      userId,
      addressId: address._id,
      isApproved: isNewAddress,
      isAdmin: isNewAddress,
    });

    await relation.save();

    res.status(200).json({
      status: "success",
      message: "Server address added successfully.",
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
  getUserInformation,
  getUserServerAddresses,
  registerServerAddress,
};
