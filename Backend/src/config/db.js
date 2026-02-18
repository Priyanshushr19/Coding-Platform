import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URL;

    if (!uri) {
      console.log("❌ MONGODB_URL missing");
      return;
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");

  } catch (err) {
    console.log("Mongo error:", err.message);
  }
};
