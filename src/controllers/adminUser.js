const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");

const getPendingRequests = async (req, res) => {
  const addressIds = req.query.id;

  try {
    const requestsPromises = addressIds.map((addressId) =>
      UserServerRelation.find({ addressId, isAdmin: false }).lean(),
    );

    const addressesPromises = addressIds.map((addressId) =>
      ServerAddress.findById(addressId).lean(),
    );

    const requestsResults = await Promise.all(requestsPromises);
    const addressesResults = await Promise.all(addressesPromises);

    const combinedResults = requestsResults.map((requests, index) => ({
      requests: requests,
      address: addressesResults[index].address,
    }));

    res.status(200).json({
      isAdmin: true,
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

module.exports = {
  getPendingRequests,
};
