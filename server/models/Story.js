const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now, expires: '24h' } // Auto-delete after 24 hours
});

module.exports = mongoose.model('Story', storySchema);
