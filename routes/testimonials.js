const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { dataCache } = require('../server'); // Import cache

const CACHE_KEY = 'allTestimonials';

// @route   GET api/testimonials
// @desc    Get all testimonials (with Caching)
// @access  Public
router.get('/', async (req, res) => {
  try {
    // --- ADDED: Check cache ---
    const cachedTestimonials = dataCache.get(CACHE_KEY);
    if (cachedTestimonials) {
      console.log('Serving testimonials from cache');
      return res.json(cachedTestimonials);
    }

    // --- Fetch from DB ---
    console.log('Fetching testimonials from DB');
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    // --- ADDED: Store in cache ---
    dataCache.set(CACHE_KEY, testimonials);

    res.json(testimonials);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/testimonials/add
// @desc    Create a new testimonial
// @access  Public
router.post('/add', async (req, res) => {
  try {
    const newTestimonial = new Testimonial(req.body);
    const savedTestimonial = await newTestimonial.save();

    // --- ADDED: Invalidate cache ---
    dataCache.del(CACHE_KEY);
    console.log('Cache invalidated for testimonials');

    res.json(savedTestimonial);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;