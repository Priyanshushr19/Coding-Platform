import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    console.log("ENV URI exists:", !!uri);
    console.log("Trying to connect to:", uri);

    if (!uri) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("✅ MongoDB connected successfully");

  } catch (err) {
    console.log("❌ FULL MongoDB Error:");
    console.log(err);
  }
};
