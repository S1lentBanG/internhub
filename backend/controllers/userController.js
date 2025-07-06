const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Update user's general profile information (e.g., name)
// @route   PUT /api/users/update-profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name.trim();
    await user.save();

    // Return only non-sensitive user data
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      profilePic: user.profilePic,
    };

    res.json({ message: 'Name updated successfully', user: updatedUser });

  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user's password
// @route   PUT /api/users/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully.' });

  } catch (error) {
    console.error('Error updating password:', error.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user's profile picture
// @route   PUT /api/users/update-profile-picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No profile picture file uploaded.' });
    }

    // Construct the path to be stored. Assuming /uploads is served statically.
    // The path should be relative to the server root from the frontend's perspective.
    const profilePicPath = `/uploads/profile-pics/${req.file.filename}`;

    user.profilePic = profilePicPath;
    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error('Error updating profile picture:', error.message);
    if (error.name === 'MulterError') {
        return res.status(400).json({ message: `File upload error: ${error.message}` });
    }
    res.status(500).send('Server error');
  }
}; 