const Internship = require('../models/Internship');
const Application = require('../models/Application'); // Import Application model

// Create internship (CCPD/Admin only)
exports.createInternship = async (req, res) => {
  try {
    if (!['ccpd', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    // Validate required fields
    const { title, companyName, description, location, deadline } = req.body;
    if (!title || !companyName || !description || !location || !deadline) {
      return res.status(400).json({ message: 'Please fill all the required fields.' });
    }
    const internship = await Internship.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json({ message: 'Internship posted successfully', internship });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all internships (with optional filters and pagination)
exports.getAllInternships = async (req, res) => {
  try {
    const { q, domain, location, company, cgpaCutoff, page = 1, limit = 10 } = req.query;
    let filter = {};
    let anAndClause = []; // Use an array to build $and conditions

    // Branch filter for students - applied first
    if (req.user && req.user.role === 'student' && req.user.branch) {
      anAndClause.push({
        $or: [
          { branch: { $in: [req.user.branch] } },
          { branch: { $exists: false } },
          { branch: { $size: 0 } }
        ]
      });
    }

    // Text search (q parameter)
    if (q) {
      const searchRegex = new RegExp(q, 'i'); // Case-insensitive regex
      anAndClause.push({
        $or: [
          { title: searchRegex },
          { companyName: searchRegex },
          { location: searchRegex },
          { description: searchRegex },
          { skills: { $elemMatch: { $regex: searchRegex } } }, // Search within skills array
          { domain: { $elemMatch: { $regex: searchRegex } } }  // Search within domain array
        ]
      });
    }

    // Other existing filters
    if (domain) anAndClause.push({ domain: { $elemMatch: { $regex: new RegExp(domain, 'i') } } });
    if (location) anAndClause.push({ location: new RegExp(location, 'i') });
    if (company) anAndClause.push({ companyName: new RegExp(company, 'i') });
    if (cgpaCutoff) {
      const cgpaValue = parseFloat(cgpaCutoff);
      if (!isNaN(cgpaValue)) {
        anAndClause.push({ cgpaCutoff: cgpaValue });
      }
    }
    
    // Apply the $and clause if it has any conditions
    if (anAndClause.length > 0) {
      filter.$and = anAndClause;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const totalItems = await Internship.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    const internships = await Internship.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      internships,
      currentPage: pageNum,
      totalPages,
      totalItems
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single internship by ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update internship (CCPD/Admin only)
exports.updateInternship = async (req, res) => {
  try {
    if (!['ccpd', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete internship (CCPD/Admin only)
exports.deleteInternship = async (req, res) => {
  try {
    if (!['ccpd', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized: Only CCPD or Admin can delete internships.' });
    }

    const internshipId = req.params.id;
    console.log('[BACKEND LOG] Attempting to delete internship with ID:', internshipId);

    // First, check if the internship exists
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    // Delete associated applications
    await Application.deleteMany({ internship: internshipId });

    // Then, delete the internship itself
    await Internship.findByIdAndDelete(internshipId);

    res.json({ message: 'Internship and associated applications deleted successfully' });

  } catch (err) {
    console.error("Error deleting internship:", err.message);
    res.status(500).json({ message: 'Server error while deleting internship', error: err.message });
  }
};
