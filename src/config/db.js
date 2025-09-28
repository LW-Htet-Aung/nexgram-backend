import mongoose from "mongoose";
import { ENV } from "../config/env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URL);
    console.log("Connected To DB Successfully 🚀");
  } catch (error) {
    console.log(error, "err");
    process.exit(1);
  }
};
