require("dotenv").config();
const mongoose = require("mongoose");

const { MONGODB_CLUSTER, MONGODB_NAME } = process.env;

const connectDB = async () => {
  await mongoose.connect(`${MONGODB_CLUSTER}${MONGODB_NAME}`);
};

module.exports = {
  connectDB,
};
