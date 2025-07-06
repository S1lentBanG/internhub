const express = require('express');
const Application = require('../models/Application');
const Internship = require('../models/Internship');
const { authenticate } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Apply for an internship (Student only)
router.post('/', authenticate, applicationController.createApplication);

// Get all applications for the logged-in student
router.get('/my', authenticate, applicationController.getMyApplications);

// Get all applications for a specific internship (CCPD/Admin only)
router.get('/internship/:internshipId', authenticate, applicationController.getApplicationsForInternship);

// Update application status (CCPD/Admin or company user if you add that role)
router.patch('/:applicationId/status', authenticate, applicationController.updateApplicationStatus);

module.exports = router;