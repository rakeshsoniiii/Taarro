const express = require('express');
const db = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route  GET /api/matches
// @desc   Get all matches for current user
router.get('/', protect, (req, res) => {
  try {
    const matches = db.getMatchesForUser(req.user._id);
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  GET /api/matches/:matchId/messages
// @desc   Get messages for a match
router.get('/:matchId/messages', protect, (req, res) => {
  try {
    const match = db.findMatchById(req.params.matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (!db.isMatchParticipant(req.params.matchId, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = db.getMessages(req.params.matchId);

    // Mark messages as read
    db.markMessagesRead(req.params.matchId, req.user._id);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route  POST /api/matches/:matchId/messages
// @desc   Send a message (REST fallback — primarily done via socket)
router.post('/:matchId/messages', protect, (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text required' });
    }

    const match = db.findMatchById(req.params.matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (!db.isMatchParticipant(req.params.matchId, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const message = db.createMessage(req.params.matchId, req.user._id, text.trim());

    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
