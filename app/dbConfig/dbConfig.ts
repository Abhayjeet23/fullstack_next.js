import mongoose from "mongoose";

let isConnected = false;

export async function connect() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "authapp",
    });

    isConnected = true;

    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
