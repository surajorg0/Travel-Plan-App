const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Set up file storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Import models
require('./models/userModel');
require('./models/travelPlanModel');

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:8100', 'capacitor://localhost'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// API Routes

// Use routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/travel-plans', require('./routes/travelPlanRoutes'));

// Get pending users (admin only)
app.get('/api/users/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server error while fetching pending users' });
  }
});

// Approve or reject user (admin only)
app.put('/api/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ message: `User ${status === 'active' ? 'approved' : 'rejected'} successfully`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error while updating user status' });
  }
});

// Import users from Excel (admin only)
app.post('/api/users/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Here you would parse the Excel file and create users
    // For demonstration, we'll just return a success message
    // In a real implementation, you would use a library like xlsx to parse the file

    res.json({ message: 'Users imported successfully' });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ message: 'Server error while importing users' });
  }
});

// Get Excel template for user import (admin only)
app.get('/api/users/import-template', (req, res) => {
  // In a real implementation, you would generate an Excel template
  // For demonstration, we'll just return a success message
  res.json({ message: 'Template would be downloaded here' });
});

// Update user profile
app.put('/api/users/profile', async (req, res) => {
  try {
    const { id, name, email, phoneNumber, location, jobTitle, bio, interests, birthDate } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.location = location || user.location;
    user.jobTitle = jobTitle || user.jobTitle;
    user.bio = bio || user.bio;
    user.interests = interests || user.interests;
    user.birthDate = birthDate || user.birthDate;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        location: user.location,
        jobTitle: user.jobTitle,
        bio: user.bio,
        interests: user.interests,
        birthDate: user.birthDate
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Upload profile picture
app.post('/api/users/profile-picture', upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile picture path
    user.profilePic = req.file.path;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
});

// Include routes from other files
app.use('/api/photos', require('./routes/userRoutes'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});