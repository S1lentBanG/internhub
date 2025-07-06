const express = require('express');
const router = express.Router();
const filterOptionController = require('../controllers/filterOptionController');

// GET /api/filter-options - Fetches all distinct filter options
router.get('/', filterOptionController.getFilterOptions);

module.exports = router; 