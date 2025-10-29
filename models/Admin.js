const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Fields for password reset
    resetPasswordOtp: { type: String },
    resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('Admin', AdminSchema);