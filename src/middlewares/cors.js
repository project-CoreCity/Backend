const cors = require("cors");

const corsOptions = {
  origin: process.env.LOCALHOST_FRONTEND,
};

module.exports = cors(corsOptions);
