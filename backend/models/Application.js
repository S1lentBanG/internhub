const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interviewing',
      'Offered',
      'Not Selected',
      'Withdrawn', // Student can withdraw their application
    ],
    default: 'Applied',
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // Future: Add resume link or any other application-specific details here
  // resumeUrl: { type: String }, 
  // coverLetter: { type: String },
});

// Ensure a student can apply to an internship only once
ApplicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);