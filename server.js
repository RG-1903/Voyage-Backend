const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const NodeCache = require("node-cache");

// --- Cache Setup ---
const dataCache = new NodeCache({ stdTTL: 120, checkperiod: 150 });
// No longer need to export cache for Vercel routes, but keep it for internal use
// module.exports.dataCache = dataCache; // Removed this export

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

// --- CORS Configuration (Keep as is, allows your Vercel frontend) ---
const corsOptions = {
  origin: 'https://voyage-frontend-beta.vercel.app', // Your frontend URL
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Middlewares ---
app.use(express.json());
// --- Important for Render Uploads ---
// Render doesn't use /tmp like Vercel. We'll configure Multer later if needed,
// but for now, this static path is less relevant unless uploads are broken.
// Let's keep it for now but be aware Render might need a different upload strategy.
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Changed to relative path

// --- Mongoose 60-Second Timeout (Good for Render free tier too) ---
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  family: 4
};

// --- MongoDB Connection ---
console.log("<<<<< ATTEMPTING MONGO CONNECTION WITH 60s TIMEOUT >>>>>");
mongoose
  .connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log("✅ MongoDB Connected Successfully... 🔌"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ message: "Voyage API (Render) is running! 🚀" }); // Updated message
});

app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

// --- !! RENDER STARTUP CODE !! ---
// Use the PORT environment variable provided by Render or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));