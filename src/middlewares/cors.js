const cors = require("cors");

const corsOptions = {
  origin: process.env.FRONTEND_URL,
};

module.exports = cors(corsOptions);
