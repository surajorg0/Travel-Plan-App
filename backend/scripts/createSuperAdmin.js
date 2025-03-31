const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-plan-db')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import User model
require('../models/userModel');
const User = mongoose.model('User');

// Function to create superadmin user
const createSuperAdmin = async () => {
  try {
    // Check if superadmin already exists
    const superadminExists = await User.findOne({ email: 'superadmin@gmail.com' });
    
    if (superadminExists) {
      console.log('Superadmin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create superadmin user
    const superadmin = new User({
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      phoneNumber: '1234567890',
      location: 'Admin Office',
      jobTitle: 'System Administrator',
      bio: 'System administrator with full access'
    });

    await superadmin.save();
    console.log('Superadmin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating superadmin user:', error);
    process.exit(1);
  }
};

// Run the function
createSuperAdmin();