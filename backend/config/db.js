import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DEBUG] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[DEBUG] Active Database Name: "${conn.connection.name}"`); // CRITICAL CHECK
  } catch (error) {
    console.error(`[CRITICAL] Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};
