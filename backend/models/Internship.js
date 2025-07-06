const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    companyName: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['full-time', 'part-time', 'remote'], default: 'full-time' },
    salary: { type: String },
    cgpaCutoff: { type: Number, min: 0, max: 10 },
    deadline: { type: Date, required: true },
    domain: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    branch: {
      type: [String],
      enum: [
        'CSE',
        'ECE',
        'EEE',
        'Mathematics & Computing',
        'Mechanical',
        'Civil',
        'Chemical',
        'Biotechnology'
      ],
      default: []
    },
    internshipPeriod: { type: String },
    companyLogoUrl: { type: String, default: '' },
    responsibilities: { type: String, default: '' },
    aboutCompany: { type: String, default: '' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);