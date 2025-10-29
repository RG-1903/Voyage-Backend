const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Simple test route ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Voyage API is running! 🚀' });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));

// --- MongoDB Connection ---
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log('✅ MongoDB Connected Successfully... 🔌');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
}

connectDB();

// --- For Vercel ---
module.exports = app; // ✅ Vercel expects the Express app, not serverless(app)
module.exports.handler = serverless(app); // ✅ fallback for Vercel Functions

// --- Local development ---
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`🚀 Server started locally at http://localhost:${PORT}`));
}
