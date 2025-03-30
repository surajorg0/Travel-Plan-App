const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const fs = require('fs');
const path = require('path');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, birthDate, interests, phoneNumber, location, jobTitle, bio } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      role: role || 'employee',
      birthDate,
      interests,
      phoneNumber,
      location,
      jobTitle,
      bio,
      status: 'pending' // New users are pending by default
    });

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'User registered successfully. Pending admin approval.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Your account is pending approval or has been rejected' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Get pending users
// @route   GET /api/users/pending
// @access  Admin
const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server error while fetching pending users' });
  }
};

// @desc    Approve or reject user
// @route   PUT /api/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
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
};

// @desc    Import users from Excel
// @route   POST /api/users/import
// @access  Admin
const importUsers = async (req, res) => {
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
};

// @desc    Get Excel template for user import
// @route   GET /api/users/import-template
// @access  Admin
const getImportTemplate = (req, res) => {
  // In a real implementation, you would generate an Excel template
  // For demonstration, we'll just return a success message
  res.json({ message: 'Template would be downloaded here' });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
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
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
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
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getPendingUsers,
  updateUserStatus,
  importUsers,
  getImportTemplate,
  updateProfile,
  uploadProfilePicture
};