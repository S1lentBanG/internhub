const Internship = require('../models/Internship');

exports.getFilterOptions = async (req, res) => {
  try {
    const domains = await Internship.distinct('domain').exec();
    const locations = await Internship.distinct('location').exec();
    const companyNames = await Internship.distinct('companyName').exec();
    // For CGPA, you might have a predefined list or also fetch distinct values if they are stored consistently.
    // For this example, we'll send back the fetched unique values and let frontend decide if it wants a predefined list too.
    const cgpaCutoffs = await Internship.distinct('cgpaCutoff').sort({ cgpaCutoff: 1 }).exec(); 

    res.json({
      domains: domains.filter(d => d), // Filter out null/empty values
      locations: locations.filter(l => l),
      companyNames: companyNames.filter(c => c),
      cgpaCutoffs: cgpaCutoffs.filter(c => c !== null && c !== undefined).sort((a,b) => a - b) // Filter out null/undefined and sort numerically
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ message: 'Server error fetching filter options' });
  }
}; 