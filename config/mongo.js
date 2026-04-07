import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
