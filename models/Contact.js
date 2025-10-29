const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Responded']
  },
  responseText: { // New Field
    type: String 
  },
  respondedAt: { // New Field
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('contact', ContactSchema);