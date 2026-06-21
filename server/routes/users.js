const express = require('express');
const { db } = require('../config/dbAdapter');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// @route  GET /api/users/profile
// @desc   Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await db.findUserById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  PUT /api/users/profile
// @desc   Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'dateOfBirth', 'gender',
      'religion', 'caste', 'motherTongue', 'maritalStatus',
      'height', 'weight', 'education', 'occupation', 'annualIncome',
      'familyType', 'familyStatus', 'diet', 'smoking', 'drinking',
      'hobbies', 'city', 'state', 'country',
      'preferences', 'profileComplete', 'profileCompletionStep',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await db.updateUser(req.user._id, updates);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  PUT /api/users/location
// @desc   Update user location
router.put('/location', protect, async (req, res) => {
  try {
    const { longitude, latitude, city, state } = req.body;
    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Coordinates required' });
    }

    const updates = {
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
    };
    if (city) updates.city = city;
    if (state) updates.state = state;

    const user = await db.updateUser(req.user._id, updates);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  POST /api/users/photos
// @desc   Upload a photo (up to 6)
router.post('/photos', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await db.findUserById(req.user._id);
    if (user.photos.length >= 6) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Maximum 6 photos allowed' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await db.updateUser(req.user._id, { photos: [...user.photos, photoUrl] });

    res.json({ success: true, user: updatedUser, photoUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  DELETE /api/users/photos/:index
// @desc   Delete a photo by index
router.delete('/photos/:index', protect, async (req, res) => {
  try {
    const user = await db.findUserById(req.user._id);
    const idx = parseInt(req.params.index);

    if (idx < 0 || idx >= user.photos.length) {
      return res.status(400).json({ success: false, message: 'Invalid photo index' });
    }

    const photoPath = user.photos[idx];
    const filePath = path.join(__dirname, '..', photoPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const updatedPhotos = [...user.photos];
    updatedPhotos.splice(idx, 1);
    const updatedUser = await db.updateUser(req.user._id, { photos: updatedPhotos });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  GET /api/users/:id
// @desc   Get a specific user (public profile)
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await db.findUserById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password, location, preferences, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
