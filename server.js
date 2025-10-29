const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const NodeCache = require("node-cache"); // Import node-cache

// --- ADDED: Initialize Cache ---
// TTL (Time To Live) in seconds, stdTTL: 120 = 2 minutes
// checkperiod: How often to check for expired keys (seconds)
const dataCache = new NodeCache({ stdTTL: 120, checkperiod: 150 });
module.exports.dataCache = dataCache; // Export cache for routes to use

// Import routes
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

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join("/tmp")));

// --- ADDED: Mongoose connection options to increase timeout ---
// We are telling Mongoose to wait up to 30 seconds for the database
// to respond before timing out. This should be long enough for
// the free M0 cluster to wake up.
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000,         // 30 seconds
  socketTimeoutMS: 30000,          // 30 seconds
};

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, mongooseOptions) // <-- Pass options here
  .then(() => console.log("✅ MongoDB Connected Successfully... 🔌"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Voyage API is running! 🚀" });
});

// Use routes
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