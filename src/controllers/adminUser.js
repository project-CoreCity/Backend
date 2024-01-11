const ServerAddress = require("../models/ServerAddress");
const UserServerRelation = require("../models/UserServerRelation");

const getPendingRequests = async (req, res) => {
  const addressIds = req.query.id;

  try {
    const requestPromises = addressIds.map((addressId) =>
      UserServerRelation.find({ addressId, isAdmin: false }).lean(),
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

module.exports = {
  getPendingRequests,
};
