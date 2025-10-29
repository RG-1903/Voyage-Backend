const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const Package = require('../models/Package');
const { sendBookingConfirmationEmail } = require('../utils/mailer');

// @route   GET api/requests
// @desc    Get all booking requests (Admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message); 
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests/mybookings
// @desc    Get a user's own bookings
// @access  Private (User)
router.get('/mybookings', auth, async (req, res) => {
  try {
    const bookings = await Request.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message); 
    res.status(500).send('Server Error');
  }
});

// @route   POST api/requests/add
// @desc    Create a new booking request and send confirmation email
// @access  Private (User)
router.post('/add', auth, async (req, res) => {
  // --- UPDATE: Added server-side validation ---
  const { clientPhone, packageName, date, guests, totalAmount, transactionId } = req.body;
  
  if (!clientPhone || !packageName || !date || !guests || !totalAmount || !transactionId) {
    return res.status(400).json({ msg: 'Please provide all required booking details.' });
  }

  try {
    const newRequestData = { ...req.body, userId: req.user.id };
    const newRequest = new Request(newRequestData);
    const savedRequest = await newRequest.save();

    const pkg = await Package.findOne({ title: savedRequest.packageName });
    if (pkg) {
      const emailDetails = {
        ...savedRequest._doc,
        location: pkg.location,
        duration: pkg.duration,
        price: pkg.price 
      };
      await sendBookingConfirmationEmail(savedRequest.clientEmail, emailDetails);
    } else {
        console.error(`Package "${savedRequest.packageName}" not found for sending email.`);
    }
    
    res.status(201).json(savedRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'An error occurred while creating your booking. Please try again.' });
  }
});

// @route   POST api/requests/update/:id
// @desc    Update a request's status
// @access  Private
router.post('/update/:id', auth, async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );
    res.json(updatedRequest);
  } catch (err) {
    console.error(err.message); 
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/requests/:id
// @desc    Delete a request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    
    await Request.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Request removed successfully' });
  } catch (err) {
    console.error(err.message); 
    res.status(500).send('Server Error');
  }
});

module.exports = router;