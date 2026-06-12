const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route  GET /api/discover
// @desc   Get profiles filtered by preferences
router.get('/', protect, (req, res) => {
  try {
    const users = db.getDiscoverProfiles(req.user._id);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  GET /api/discover/nearby-map
// @desc   Get nearby users with fuzzy coordinates for map view
router.get('/nearby-map', protect, (req, res) => {
  try {
    const users = db.getNearbyMapUsers(req.user._id);
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
