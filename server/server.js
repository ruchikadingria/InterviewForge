import express, { json } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";


dotenv.config();


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/", (req, res) => {
    res.send("hello word");
})

const startServer = async () => {
    const conn = await connectDB();
    if (conn) {
        app.listen(process.env.PORT || 8000, () => {
            console.log("Server is running on port 8000")
        })
    }
    else {
        console.log("Error");
    }
}

startServer();