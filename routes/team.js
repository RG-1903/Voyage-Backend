const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TeamMember = require('../models/TeamMember');
const multer = require('multer');
const path = require('path');
const { dataCache } = require('../server'); // Import cache

const CACHE_KEY = 'allTeamMembers';

// Multer setup (remains the same)
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, '/tmp'); },
  filename: function (req, file, cb) { cb(null, 'team-' + Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// @route   GET api/teams
// @desc    Get all team members (with Caching)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // --- ADDED: Check cache ---
    const cachedMembers = dataCache.get(CACHE_KEY);
    if (cachedMembers) {
        console.log('Serving team members from cache');
        return res.json(cachedMembers);
    }

    // --- Fetch from DB ---
    console.log('Fetching team members from DB');
    const teamMembers = await TeamMember.find().sort({ createdAt: 'asc' });

    // --- ADDED: Store in cache ---
    dataCache.set(CACHE_KEY, teamMembers);

    res.json(teamMembers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/teams/add
// @desc    Add a new team member
// @access  Private (Admin)
router.post('/add', [auth, upload.single('imageFile')], async (req, res) => {
  try {
    const { name, title } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : '';

    if (!name || !title || !imagePath) {
        return res.status(400).json({ msg: 'Please enter all fields and upload an image.' });
    }

    const newTeamMember = new TeamMember({ name, title, image: imagePath });
    const savedMember = await newTeamMember.save();

    // --- ADDED: Invalidate cache ---
    dataCache.del(CACHE_KEY);
    console.log('Cache invalidated for team members');

    res.json(savedMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/teams/update/:id
// @desc    Update an existing team member
// @access  Private (Admin)
router.post('/update/:id', [auth, upload.single('imageFile')], async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
        updateData.image = `uploads/${req.file.filename}`;
    }

    const updatedMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    // --- ADDED: Invalidate cache ---
    dataCache.del(CACHE_KEY);
    console.log('Cache invalidated for team members');

    res.json(updatedMember);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/teams/:id
// @desc    Delete a team member
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);

    // --- ADDED: Invalidate cache ---
    dataCache.del(CACHE_KEY);
    console.log('Cache invalidated for team members');

    res.json({ msg: 'Team member removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;