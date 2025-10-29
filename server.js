const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
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

// --- !! THIS IS THE FIX !! ---
// Configure CORS to allow requests ONLY from your frontend domain
const corsOptions = {
  origin: 'https://voyage-frontend-beta.vercel.app', // Your frontend URL
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions)); // Use the configured cors middleware
// ------------------------------

// --- Other Middlewares ---
app.use(express.json());
app.use("/uploads", express.static(path.join("/tmp")));

// --- DB Timeout Fix ---
const mongooseOptions = {
  serverSelectionTimeoutMS: 60000, 
  connectTimeoutMS: 60000,         
  socketTimeoutMS: 60000,          
};

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, mongooseOptions) 
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