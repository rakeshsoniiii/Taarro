const express = require('express');
const { db } = require('../config/dbAdapter');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// AI Bio Generator
router.post('/ai/generate-bio', protect, async (req, res) => {
  try {
    const { interests, profession } = req.body;
    const result = await db.generateBio(interests, profession);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Photo Rating
router.post('/ai/rate-photos', protect, async (req, res) => {
  try {
    const { photos } = req.body;
    const result = await db.ratePhotos(photos);
    res.json({ success: true, ratings: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Date Planner
router.post('/ai/plan-date', protect, async (req, res) => {
  try {
    const { location } = req.body;
    const result = await db.planDate(location);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Love Score
router.post('/ai/love-score', protect, async (req, res) => {
  try {
    const { user1Id, user2Id } = req.body;
    const user1 = await db.findUserById(user1Id);
    const user2 = await db.findUserById(user2Id);
    const result = await db.calculateLoveScore(user1, user2);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stories
router.post('/stories', protect, upload.single('media'), async (req, res) => {
  try {
    const { caption, mediaType } = req.body;
    const mediaUrl = `/uploads/${req.file.filename}`;
    const story = await db.createStory(req.user._id, mediaUrl, mediaType, caption);
    res.json({ success: true, story });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/stories', protect, async (req, res) => {
  try {
    const stories = await db.getStories(req.user._id);
    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Communities
router.get('/communities', protect, async (req, res) => {
  try {
    const communities = await db.getCommunities();
    res.json({ success: true, communities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/communities/:id/join', protect, async (req, res) => {
  try {
    const community = await db.joinCommunity(req.params.id, req.user._id);
    res.json({ success: true, community });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/communities/:id/leave', protect, async (req, res) => {
  try {
    const community = await db.leaveCommunity(req.params.id, req.user._id);
    res.json({ success: true, community });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Match Anniversary & Couple Dashboard
router.get('/matches/:id/anniversary', protect, async (req, res) => {
  try {
    const match = await db.findMatchById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    
    const timeline = [
      { date: match.createdAt, event: 'First matched!' },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), event: 'One week anniversary!' },
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), event: 'One month anniversary!' }
    ];

    res.json({ 
      success: true, 
      timeline, 
      memories: ['First message', 'First date plan'] 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/matches/:id/dashboard', protect, async (req, res) => {
  try {
    const match = await db.findMatchById(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    
    res.json({
      success: true,
      bucketList: ['Travel to Paris', 'Try skydiving', 'Learn a new language'],
      goals: ['Exercise together 3x/week', 'Cook together once a week'],
      memories: ['First message', 'First date plan']
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
