console.log("<<<<< RUNNING LATEST server.js CODE - Oct 29, 7:10 PM >>>>>");
// ---------------------------

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

// --- CORS Fix ---
const corsOptions = {
  origin: 'https://voyage-frontend-beta.vercel.app', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Middlewares ---
app.use(express.json());
app.use("/uploads", express.static(path.join("/tmp")));

// --- !! 60-SECOND TIMEOUT FIX !! ---
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000, // 60 seconds
  connectTimeoutMS: 60000,         // 60 seconds
  socketTimeoutMS: 60000,          // 60 seconds
  family: 4 // Force IPv4
};
// --- End Timeout Fix ---

// --- MongoDB Connection ---
// --- ADDED FOR DEBUGGING ---
console.log("<<<<< ATTEMPTING MONGO CONNECTION WITH 60s TIMEOUT >>>>>");
// ---------------------------
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