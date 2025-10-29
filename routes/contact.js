const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const { sendAdminResponseEmail } = require('../utils/mailer'); // Import the mailer utility

// ... (POST /add and GET / routes are unchanged) ...
router.post('/add', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ msg: 'Please fill out all fields.' });
    }
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    res.status(201).json({ msg: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error(err.message); res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message); res.status(500).send('Server Error');
  }
});


// @route   POST api/contact/respond/:id
// @desc    Respond to a contact message and send email (Admin)
// @access  Private (Admin)
router.post('/respond/:id', auth, async (req, res) => {
  try {
    const { responseText } = req.body;
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // --- USE THE MAILER ---
    await sendAdminResponseEmail(
        message.email, 
        message.name, 
        message.subject, 
        responseText
    );

    message.status = 'Responded';
    message.responseText = responseText;
    message.respondedAt = new Date();
    await message.save();

    res.json({ msg: 'Response sent successfully.', message });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;