const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path"); // Import path

// Import all routes
const authRoutes = require("./routes/auth.js");
const packageRoutes = require("./routes/packages.js");
const requestRoutes = require("./routes/requests.js");
const userRoutes = require("./routes/users.js");
const profileRoutes = require("./routes/profile.js");
const contactRoutes = require("./routes/contact.js");
const teamRoutes = require("./routes/team.js");
const testimonialRoutes = require("./routes/testimonials.js");
// You have two files named Request.js, assuming this is for the 'TeamMember' model
const teamModelRoutes = require("./routes/team.js"); 

dotenv.config();
const app = express();

// Middlewares
//app.use(cors());

// Add the specific origin for the Postman web app
app.use(cors({
  origin: 'https://rg-1903-793592.postman.co'
}));
app.use(express.json());

// --- VERCEL FILE SYSTEM FIX ---
// Serve temporarily uploaded files from the /tmp directory
// When a user requests /uploads/filename.png, Express will look for it in /tmp
app.use("/uploads", express.static(path.join("/tmp")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI) // Removed deprecated options
  .then(() => console.log("✅ MongoDB Connected Successfully... 🔌"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Voyage API is running! 🚀" });
});

// Use all routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Export for Vercel
module.exports = app;