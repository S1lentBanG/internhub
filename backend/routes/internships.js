const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const internshipController = require('../controllers/internshipController');

// Create internship (CCPD/Admin only)
router.post('/', authenticate, internshipController.createInternship);

// Get all internships (with optional filters and pagination)
router.get('/', internshipController.getAllInternships);

// Get single internship by ID
router.get('/:id', internshipController.getInternshipById);

// Update internship (CCPD/Admin only)
router.put('/:id', authenticate, internshipController.updateInternship);

// Delete internship (CCPD/Admin only)
router.delete('/:id', authenticate, internshipController.deleteInternship);

module.exports = router;