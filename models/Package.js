const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  image: { type: String, required: true },
  type: { type: String, required: true, enum: ['Adventure', 'Relaxation', 'Cultural'] },
  description: { type: String, required: true },
  highlights: [String],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('package', PackageSchema);