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

// --- API Routes ---
app.get('/', (req, res) => res.send('Voyage API is running! 🚀'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully... 🔌'))
  .catch((err) => console.error('MongoDB Connection Error:', err.message));

// ✅ --- Export handler for Vercel ---
module.exports = app;
module.exports.handler = serverless(app);

// ✅ --- Optional: Run locally ---
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
}
