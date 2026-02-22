import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.log("❌ MONGODB_URL missing");
      return;
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected"+uri);

  } catch (err) {
    console.log("Mongo error:", err.message);
  }
};
