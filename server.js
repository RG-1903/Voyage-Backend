const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const NodeCache = require("node-cache");

// --- Cache Setup ---
const dataCache = new NodeCache({ stdTTL: 120, checkperiod: 150 });
module.exports.dataCache = dataCache; 

// --- Import Routes ---
const authRoutes = require("./routes/auth.js");
const packageRoutes = require("./routes/packages.js");
const requestRoutes = require("./routes/requests.js");
const userRoutes = require("./routes/users.js");
const profileRoutes = require("./routes/profile.js");
const contactRoutes = require("./routes/contact.js");
const teamRoutes = require("./routes/team.js");
const testimonialRoutes = require("./routes/testimonials.js");

dotenv.config();
const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join("/tmp")));

// --- !! THIS IS THE FIX !! ---
// Increase timeout from 10s to 60s to allow free DB to wake up
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  connectTimeoutMS: 60000,         // 60 seconds
  socketTimeoutMS: 60000,          // 60 seconds
};
// ------------------------------

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, mongooseOptions) // Pass options here
  .then(() => console.log("✅ MongoDB Connected Successfully... 🔌"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ message: "Voyage API is running! 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Export app for Vercel
module.exports = app;