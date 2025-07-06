const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, branch, ccpdCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (role === 'student' && !branch) {
      return res.status(400).json({ message: 'Branch is required for student registration.' });
    }
    const MOCK_CCPD_VERIFICATION_CODE = "nitw-ccpd-2025";
    if (role === 'ccpd' && ccpdCode !== MOCK_CCPD_VERIFICATION_CODE) {
        return res.status(400).json({ message: 'Invalid CCPD verification code.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const userData = {
      name,
      email,
      password: hashed,
      role: role || 'student',
    };
    if (role === 'student') {
      userData.branch = branch;
    }
    const user = await User.create(userData);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      resumeUrl: user.resumeUrl,
    };
    if (user.branch) {
      userResponse.branch = user.branch;
    }
    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message, errors: err.errors });
    }
    console.error("Registration error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;