const jwt = require('jsonwebtoken');
const Client = require('../models/Client'); // Import Client model
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = async function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;

    // --- NEW: Check if the user is blocked ---
    if (req.user.role !== 'admin') {
        const user = await Client.findById(req.user.id);
        if (user && user.isBlocked) {
            return res.status(403).json({ msg: 'Access denied. Your account has been blocked.' });
        }
    }
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};