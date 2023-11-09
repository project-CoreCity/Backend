const mongoose = require("mongoose");
const UserServerRelation = require("../models/UserServerRelation");

const getUserSeverAddresses = async (req, res) => {
  try {
    console.log(req.params);
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid user ID." });
    }

    const relation = await UserServerRelation.find({ userId })
      .populate("addressId")
      .exec();
    const serverAddresses = relation.map(
      (relation) => relation.addressId.address,
    );

    res.status(200).json(serverAddresses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      message: "Server encountered an error processing the request.",
    });
  }
};

module.exports = getUserSeverAddresses;
