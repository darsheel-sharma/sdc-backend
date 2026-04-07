import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    await mongoose.connect(env.DATABASE_URL);
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`MongoDB unavailable. Running with API fallback mode. (${reason})`);
    return false;
  }
};

export default connectDB;
