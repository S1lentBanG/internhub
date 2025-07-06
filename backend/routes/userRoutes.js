const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Corrected import path
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/profile-pics');
if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../uploads'));
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Multer file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB limit
  fileFilter: fileFilter 
});

// @route   PUT api/users/update-profile
// @desc    Update user's general profile information (e.g., name)
// @access  Private
router.put('/update-profile', authMiddleware.authenticate, userController.updateUserProfile);

// @route   PUT api/users/update-password
// @desc    Update user's password
// @access  Private
router.put('/update-password', authMiddleware.authenticate, userController.updatePassword);

// @route   PUT api/users/update-profile-picture
// @desc    Update user's profile picture
// @access  Private
router.put('/update-profile-picture', authMiddleware.authenticate, upload.single('profilePic'), userController.updateProfilePicture);

module.exports = router; 