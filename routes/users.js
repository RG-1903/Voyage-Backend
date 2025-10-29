const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const JWT_SECRET = process.env.JWT_SECRET;
const auth = require('../middleware/auth');
const { sendOtpEmail } = require('../utils/mailer'); // Import the mailer utility

// --- Helper Function to Generate OTP ---
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @route   POST api/users/register
// @desc    Handles initial registration and sends OTP
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    let client = await Client.findOne({ email });

    // Handle existing but unverified user
    if (client && client.otp) {
        const newOtp = generateOTP();
        client.otp = newOtp;
        client.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await client.save();
        await sendOtpEmail(email, newOtp); // Resend email
        return res.status(201).json({ msg: 'Account not verified. A new OTP has been sent.', email });
    }

    if (client) {
        return res.status(400).json({ msg: 'A verified user with this email already exists.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    client = new Client({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });
    
    await client.save();

    // --- USE THE MAILER ---
    await sendOtpEmail(email, otp);

    res.status(201).json({ msg: 'OTP sent to your email. Please verify to complete registration.', email });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ... (The rest of the file remains the same)

// @route   POST api/users/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ msg: 'User not found. Please register again.' });
    if (client.otp !== otp || client.otpExpires < Date.now()) return res.status(400).json({ msg: 'Invalid or expired OTP.' });
    
    client.otp = undefined;
    client.otpExpires = undefined;
    await client.save();
    
    res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err.message); res.status(500).send('Server Error');
  }
});

// @route   POST api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ msg: 'Invalid Credentials' });
    if (client.otp) return res.status(401).json({ msg: 'Account not verified. Please check your email for the OTP.' });
    if (client.isBlocked) return res.status(403).json({ msg: 'Your account has been blocked.' });

    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: client.id, name: client.name, email: client.email } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message); res.status(500).send('Server Error');
  }
});

// @route   GET api/users/all
router.get('/all', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied.'});
    try {
        const users = await Client.find().select('-password -otp -otpExpires');
        res.json(users);
    } catch (err) {
        console.error(err.message); res.status(500).send('Server Error');
    }
});

// @route   POST api/users/toggle-block/:id
router.post('/toggle-block/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied.'});
    try {
        const user = await Client.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json(user);
    } catch(err) {
        console.error(err.message); res.status(500).send('Server Error');
    }
});

module.exports = router;