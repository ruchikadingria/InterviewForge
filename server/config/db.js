import mongoose from "mongoose";
import dotenv from "dotenv";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!!");
        return conn;
    }
    catch (error) {
        console.log("MongoDB Connection Failed:", error.message);
    }
}

export default connectDB;