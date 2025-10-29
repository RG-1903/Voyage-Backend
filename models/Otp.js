const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '10m' // OTP document will auto-delete after 10 minutes
    }
});

module.exports = mongoose.model('Otp', OtpSchema);