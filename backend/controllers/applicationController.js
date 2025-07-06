const Application = require('../models/Application');
const Internship = require('../models/Internship'); // Might be needed for createApplication validation

// Get all applications for the logged-in student
exports.getMyApplications = async (req, res) => {
  try {
    // Ensure the user is a student (though middleware might also check role specifics)
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Forbidden: Only students can view their applications.' });
    }

    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'internship',
        select: 'title companyName domain location deadline' // Select specific fields you need
      })
      .sort({ createdAt: -1 }); // Sort by most recent application first

    res.json(applications);
  } catch (err) {
    console.error("Error fetching student applications:", err);
    res.status(500).json({ message: 'Server error while fetching applications.', error: err.message });
  }
};

// Create a new application (Student only)
exports.createApplication = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply.' });
    }
    const { internshipId, resumeUrl } = req.body;

    if (!internshipId) {
        return res.status(400).json({ message: 'Internship ID is required.'});
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) {
        return res.status(404).json({ message: 'Internship not found.' });
    }

    // Check for deadline (optional, but good practice)
    if (internship.deadline && new Date(internship.deadline) < new Date()) {
        return res.status(400).json({ message: 'Application deadline has passed.' });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      student: req.user._id,
      internship: internshipId,
    });

    if (existingApplication) {
      return res.status(409).json({ message: 'You have already applied to this internship.' });
    }

    const application = await Application.create({
      student: req.user._id,
      internship: internshipId,
      resumeUrl, // This will be undefined if not provided, which is fine if resumeUrl is optional
      // status will default to 'applied' as per schema
    });

    // Optionally populate internship details in the response
    const populatedApplication = await Application.findById(application._id).populate('internship', 'title companyName');

    res.status(201).json(populatedApplication);
  } catch (err) {
    console.error("Error creating application:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error while creating application.', error: err.message });
  }
};

// Get all applications for a specific internship (CCPD/Admin only)
exports.getApplicationsForInternship = async (req, res) => {
  try {
    if (!['ccpd', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted.' });
    }
    const { internshipId } = req.params;
    const applications = await Application.find({ internship: internshipId })
      .populate('student', 'name email branch profilePic resumeUrl') // Populate student details
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Error fetching applications for internship:", err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update application status (CCPD/Admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    if (!['ccpd', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access restricted.' });
    }
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required.'});
    }
    // Optional: Validate if the status is one of the allowed enum values from your schema
    const allowedStatuses = Application.schema.path('status').enumValues;
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true, runValidators: true }
    ).populate('internship', 'title companyName').populate('student', 'name email');

    if (!application) {
        return res.status(404).json({ message: 'Application not found.' });
    }

    res.json(application);
  } catch (err) {
    console.error("Error updating application status:", err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};
