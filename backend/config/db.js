const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

const getMongoUri = async () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  memoryServer = memoryServer || (await MongoMemoryServer.create());
  return memoryServer.getUri();
};

const connectDB = async () => {
  try {
    const mongoUri = await getMongoUri();
    await mongoose.connect(mongoUri);
    console.log(
      process.env.MONGO_URI ? "MongoDB connected" : "MongoDB connected (in-memory)"
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
