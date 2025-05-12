const express = require('express');
const User = require('../models/UserModel');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // DEBUG: Log received passwords and user
    const user = await User.findOne();
    console.log('Received currentPassword:', currentPassword);
    console.log('User found:', user ? user.username : 'none', 'with password:', user ? user.password : 'none');
    if (!user) {
      return res.status(404).json({ error: 'No admin user found' });
    }
    if (user.password !== currentPassword) {
      console.log('Password mismatch:', user.password, '!=', currentPassword);
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error in change-password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
