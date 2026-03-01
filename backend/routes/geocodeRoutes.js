const express = require('express');
const router = express.Router();
const { geocodeLocation } = require('../controllers/geocodeController');
const { protect } = require('../middleware/authMiddleware');

// Test route (no auth required) - for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Geocode route works!', timestamp: new Date().toISOString() });
});

// Main geocoding endpoint - requires authentication
router.get('/', protect, geocodeLocation);

module.exports = router;
