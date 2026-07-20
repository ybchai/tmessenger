import mongoose from "mongoose";

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("MONGO_URI is not defined");
      process.exit(1);
    }
    const conn = await mongoose.connect(mongoUri);
    console.log("Connected to database", conn.connection.host);
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
    // 1 means failure, 0 means success
  }
}

