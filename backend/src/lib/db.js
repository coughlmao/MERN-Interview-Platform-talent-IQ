import mongoose from "mongoose";

import ENV from "./env.js";

const connectDB = async () => {
  try {
    if (!ENV.DB_URL)
      throw new Error("DB_URL is not defined in environment variables");
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.error(`❌ Error connecting to MongoDB: ${e.message}`);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

export default connectDB;
