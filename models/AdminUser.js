const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
});

// The third argument 'admins' explicitly sets the collection name in MongoDB.
module.exports = mongoose.model('adminUser', AdminUserSchema, 'admins');