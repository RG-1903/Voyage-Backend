const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Package = require('../models/Package');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp'); // --- FIX: Save to /tmp directory ---
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route   GET api/packages
// @desc    Get all packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/packages/add
// @desc    Add a new package
// @access  Private (Admin)
router.post('/add', [auth, upload.single('imageFile')], async (req, res) => {
  try {
    const { title, location, price, duration, rating, type, description, highlights } = req.body;
    
    // --- FIX: Path should be relative to what server.js serves from /uploads ---
    const imagePath = req.file ? `uploads/${req.file.filename}` : (req.body.image || '');
    
    const newPackage = new Package({
        title, location, price, duration, rating, type, description, highlights,
        image: imagePath
    });

    const savedPackage = await newPackage.save();
    res.json(savedPackage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/packages/update/:id
// @desc    Update an existing package
// @access  Private (Admin)
router.post('/update/:id', [auth, upload.single('imageFile')], async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
        // --- FIX: Path should be relative to what server.js serves from /uploads ---
        updateData.image = `uploads/${req.file.filename}`;
    }
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    res.json(updatedPackage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/packages/:id
// @desc    Delete a package
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Package removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;