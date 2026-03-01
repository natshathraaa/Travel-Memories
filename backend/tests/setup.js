const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const envPath = path.join(__dirname, "..", ".env.test");
dotenv.config({ path: envPath });

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
  process.env.MONGO_URI =
    process.env.MONGO_URI_TEST ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/travel_memory_test";

  await connectDB();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
