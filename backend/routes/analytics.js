const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');

// Assuming you have these models. We will verify their paths and names.
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const User = require('../models/User');

// Middleware to check if user has access to analytics
const requireAnalyticsAccess = (req, res, next) => {
  if (req.user.role !== 'ccpd' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only CCPD and Admin users can view analytics.' });
  }
  next();
};

// @route   GET /api/analytics/summary
// @desc    Get summary statistics for the platform
// @access  Private (for CCPD/Admin)
router.get('/summary', authenticate, requireAnalyticsAccess, async (req, res) => {
  try {
    const totalInternships = await Internship.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Using aggregation to count distinct companies
    const distinctCompanies = await Internship.aggregate([
      { $group: { _id: '$companyName' } },
      { $count: 'uniqueCompanies' }
    ]);

    const uniqueCompanyCount = distinctCompanies.length > 0 ? distinctCompanies[0].uniqueCompanies : 0;

    res.json({
      totalInternships,
      totalApplications,
      totalUsers,
      uniqueCompanies: uniqueCompanyCount
    });
  } catch (err) {
    console.error('Error fetching summary analytics:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/domain-stats
// @desc    Get application counts per domain
// @access  Private (for CCPD/Admin)
router.get('/domain-stats', authenticate, requireAnalyticsAccess, async (req, res) => {
  try {
    const domainStats = await Internship.aggregate([
      // Unwind the domain array to treat each domain as a separate document
      { $unwind: '$domain' },
      // Group by domain and count the number of internships in each
      { $group: { _id: '$domain', count: { $sum: 1 } } },
      // Sort by count descending
      { $sort: { count: -1 } },
      // Limit to top 10 domains
      { $limit: 10 },
      // Rename _id to domain for cleaner output
      { $project: { _id: 0, domain: '$_id', count: 1 } }
    ]);
    res.json(domainStats);
  } catch (err) {
    console.error('Error fetching domain stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/platform-growth
// @desc    Get user signups and internship postings over the specified days (default: 30)
// @access  Private (for CCPD/Admin)
router.get('/platform-growth', authenticate, requireAnalyticsAccess, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30; // Default to 30 days if not specified
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', userSignups: '$count' } }
    ]);

    const internshipGrowth = await Internship.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', internshipsPosted: '$count' } }
    ]);

    res.json({ userGrowth, internshipGrowth, days });
  } catch (err)
  {
    console.error('Error fetching platform growth stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/popular-internships
// @desc    Get top 5 most popular internships by application count
// @access  Private (for CCPD/Admin)
router.get('/popular-internships', authenticate, requireAnalyticsAccess, async (req, res) => {
  try {
    const popularInternships = await Application.aggregate([
      // Group by internship ID and count applications
      { $group: { _id: '$internshipId', applicationCount: { $sum: 1 } } },
      // Sort by the most popular
      { $sort: { applicationCount: -1 } },
      // Limit to the top 5
      { $limit: 5 },
      // Lookup internship details from the Internships collection
      {
        $lookup: {
          from: 'internships', // the name of the collection in MongoDB
          localField: '_id',
          foreignField: '_id',
          as: 'internshipDetails'
        }
      },
      // Deconstruct the internshipDetails array
      { $unwind: '$internshipDetails' },
      // Project the final fields
      {
        $project: {
          _id: 0,
          internshipId: '$_id',
          title: '$internshipDetails.title',
          companyName: '$internshipDetails.companyName',
          applicationCount: 1
        }
      }
    ]);
    res.json(popularInternships);
  } catch (err) {
    console.error('Error fetching popular internships:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/application-status
// @desc    Get breakdown of applications by status
// @access  Private (for CCPD/Admin)
router.get('/application-status', authenticate, requireAnalyticsAccess, async (req, res) => {
  try {
    const statusStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(statusStats);
  } catch (err) {
    console.error('Error fetching application status stats:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// We will add more endpoints here later for charts and tables.

module.exports = router; 