const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// Ensure JWT secret exists
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

// @route   POST /api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please enter both username and password' });
    }

    // Check if user exists
    const user = await AdminUser.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT
    const payload = { user: { id: user.id, role: 'admin' } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Auth login error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
