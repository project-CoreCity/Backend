const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");

const getPendingRequests = async (req, res) => {
  const addressId = req.params.addressId;

  try {
    const requests = await UserServerRelation.find({
      addressId,
      isAdmin: false,
    }).lean();

    const addressInfo = await ServerAddress.findById(addressId);

    res.status(200).json({
      isAdmin: true,
      requests: requests,
      address: addressInfo.address,
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
};
