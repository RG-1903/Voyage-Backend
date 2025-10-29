const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'client',
    required: true
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: true },
  packageName: { type: String, required: true },
  date: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  requests: { type: String },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled']
  },
  paymentStatus: {
    type: String,
    default: 'Completed',
    enum: ['Pending', 'Completed', 'Failed']
  },
  transactionId: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('request', RequestSchema);