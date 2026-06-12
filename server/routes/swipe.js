const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route  POST /api/swipe
// @desc   Record a swipe (like | dislike | superlike)
router.post('/', protect, (req, res) => {
  try {
    const { targetUserId, action } = req.body;

    if (!targetUserId || !action) {
      return res.status(400).json({ success: false, message: 'targetUserId and action are required' });
    }

    if (!['like', 'dislike', 'superlike'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Check if already swiped
    const existing = db.findSwipe(req.user._id, targetUserId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already swiped on this user' });
    }

    // Create swipe record
    db.createSwipe(req.user._id, targetUserId, action);

    let matched = false;
    let matchId = null;

    // Check if the other person also liked us
    if (action === 'like' || action === 'superlike') {
      const reverseSwipe = db.findReverseSwipe(req.user._id, targetUserId);

      if (reverseSwipe) {
        // It's a match!
        const match = db.createMatch(req.user._id, targetUserId);
        matchId = match._id;
        matched = true;

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
          const targetUser = db.findUserById(targetUserId);
          const currentUser = db.findUserById(req.user._id);

          const tSafe = targetUser ? { _id: targetUser._id, name: targetUser.name, photos: targetUser.photos } : null;
          const cSafe = currentUser ? { _id: currentUser._id, name: currentUser.name, photos: currentUser.photos } : null;

          io.to(targetUserId).emit('new_match', {
            matchId: match._id,
            user: cSafe,
          });

          io.to(req.user._id).emit('new_match', {
            matchId: match._id,
            user: tSafe,
          });
        }
      }
    }

    res.json({ success: true, matched, matchId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
