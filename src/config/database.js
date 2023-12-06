const mongoose = require("mongoose");

const connectionUri = process.env.CONNECTION_URI;

const connectDatabase = async () => {
  try {
    await mongoose.connect(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDatabase;
