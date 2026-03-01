const axios = require('axios');

// @desc    Geocode a location using Nominatim OpenStreetMap API
// @route   GET /api/geocode
// @access  Private
exports.geocodeLocation = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Call Nominatim API with proper headers
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        q: query,
        addressdetails: 1,
        limit: 5
      },
      headers: {
        'User-Agent': 'travel-memory-app/1.0'
      },
      timeout: 5000 // 5 second timeout
    });

    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(404).json({ 
        message: 'No results found. Try a more specific location.',
        results: []
      });
    }

    // Return the geocoding results
    res.json({
      success: true,
      results: data
    });

  } catch (error) {
    console.error('Geocoding error:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ message: 'Geocoding service timeout. Please try again.' });
    }
    
    if (error.response) {
      return res.status(error.response.status).json({ 
        message: `Geocoding service error: ${error.response.statusText}` 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to geocode location. Please try again later.' 
    });
  }
};
