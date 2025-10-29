import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"; // adjust path if needed

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully... 🔌"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Voyage API is running! 🚀" });
});
app.use("/api/auth", authRoutes);

// Export for Vercel
import { createServer } from "http";
import { parse } from "url";

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  app(req, res, parsedUrl);
});

export default server;
