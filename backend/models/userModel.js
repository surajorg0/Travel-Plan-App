const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.status === 'active'; // Only required for active users
    }
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  profilePic: {
    type: String,
    default: ''
  },
  interests: [{
    type: String
  }],
  birthDate: {
    type: Date
  },
  phoneNumber: {
    type: String
  },
  location: {
    type: String
  },
  jobTitle: {
    type: String
  },
  bio: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;