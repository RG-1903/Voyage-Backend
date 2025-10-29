const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Admin = require('../models/Admin');
const Otp = require('../models/Otp'); // Import new OTP model
const sendEmail = require('../utils/sendEmail'); // Import email util
const crypto = require('crypto'); // Built-in Node module for random numbers

// --- USER REGISTRATION (Step 1: Send OTP) ---
// [POST] /api/auth/send-register-otp
router.post('/send-register-otp', async (req, res) => {
    const { email, name, password } = req.body;
    try {
        // Check if user already exists
        let user = await Client.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP to DB (or update if one exists for this email)
        await Otp.findOneAndUpdate(
            { email },
            { otp },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Send OTP email
        const html = `
            <h2>Welcome to Voyage, ${name}!</h2>
            <p>Your One-Time Password (OTP) for registration is:</p>
            <h1 style="font-size: 36px; letter-spacing: 4px; color: #0d9488;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
        `;
        await sendEmail(email, "Your Voyage Registration OTP", html);

        res.status(200).json({ msg: 'OTP sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- USER REGISTRATION (Step 2: Verify OTP & Create User) ---
// [POST] /api/auth/verify-register
router.post('/verify-register', async (req, res) => {
    const { name, email, password, otp } = req.body;
    try {
        // Find the OTP for this email
        const otpDoc = await Otp.findOne({ email });
        if (!otpDoc) {
            return res.status(400).json({ msg: 'OTP not found or expired. Please try again.' });
        }

        // Check if OTP matches
        if (otpDoc.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // --- OTP is valid ---
        // Check again if user was created in the meantime (race condition)
        let user = await Client.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new Client({ name, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to DB
        await user.save();
        
        // Delete the used OTP
        await Otp.deleteOne({ email });

        res.status(201).json({ msg: 'User registered successfully!' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- USER LOGIN ---
// [POST] /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await Client.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        
        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ADMIN LOGIN ---
// [POST] /api/auth/admin
router.post('/admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { admin: { id: admin.id, username: admin.username } };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- ADMIN FORGOT PASSWORD (Step 1: Send OTP) ---
// [POST] /api/auth/admin-send-reset-otp
router.post('/admin-send-reset-otp', async (req, res) => {
    const { email } = req.body; // Assuming admin has an email-like username
    try {
        const admin = await Admin.findOne({ username: email });
        if (!admin) {
            return res.status(404).json({ msg: 'Admin not found with that email/username' });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Save OTP and expiry to admin doc
        admin.resetPasswordOtp = otp;
        admin.resetPasswordExpires = Date.now() + 600000; // 10 minutes
        await admin.save();

        // Send OTP email
        const html = `
            <h2>Admin Password Reset</h2>
            <p>Your One-Time Password (OTP) for password reset is:</p>
            <h1 style="font-size: 36px; letter-spacing: 4px; color: #0d9488;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
        `;
        await sendEmail(admin.username, "Voyage Admin Password Reset OTP", html);

        res.status(200).json({ msg: 'OTP sent successfully to admin email.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ADMIN FORGOT PASSWORD (Step 2: Reset Password) ---
// [POST] /api/auth/admin-reset-password
router.post('/admin-reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const admin = await Admin.findOne({
            username: email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() } // Check if not expired
        });

        if (!admin) {
            return res.status(400).json({ msg: 'Invalid or expired OTP. Please try again.' });
        }

        // --- OTP is valid ---
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        
        // Clear OTP fields
        admin.resetPasswordOtp = undefined;
        admin.resetPasswordExpires = undefined;
        
        await admin.save();

        res.status(200).json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;