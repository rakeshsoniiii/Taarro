const mongoose = require('mongoose');
const inMemoryDB = require('./db');
const User = require('../models/User');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Story = require('../models/Story');
const Community = require('../models/Community');
const aiService = require('../services/aiService');

let useMongo = false;

const setUseMongo = (value) => {
  useMongo = value;
};

const db = {
  // User operations
  findUserById: async (id) => {
    if (useMongo) {
      return await User.findById(id);
    }
    return inMemoryDB.findUserById(id);
  },
  findUserByEmail: async (email) => {
    if (useMongo) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return inMemoryDB.findUserByEmail(email);
  },
  createUser: async (userData) => {
    if (useMongo) {
      const user = await User.create(userData);
      return user.toJSON();
    }
    return await inMemoryDB.createUser(userData);
  },
  updateUser: async (id, updates) => {
    if (useMongo) {
      return await User.findByIdAndUpdate(id, updates, { new: true });
    }
    return inMemoryDB.updateUser(id, updates);
  },
  matchPassword: async (user, password) => {
    if (useMongo) {
      return await user.matchPassword(password);
    }
    return await inMemoryDB.matchPassword(user, password);
  },

  // Discover operations
  getDiscoverProfiles: async (currentUserId) => {
    if (useMongo) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) return [];

      // Get already swiped user IDs
      const swipes = await Swipe.find({ swiper: currentUserId });
      const swipedIds = swipes.map(s => s.swiped.toString());
      swipedIds.push(currentUserId.toString());

      const { ageMin, ageMax, genders, religions } = currentUser.preferences;

      // Find matching users
      const users = await User.find({
        _id: { $nin: swipedIds },
        profileComplete: true,
        isActive: true,
        gender: { $in: genders },
        ...(religions && religions.length > 0 && { religion: { $in: religions } }),
      });

      // Filter by age and add distance
      const getAge = (dateOfBirth) => {
        const diff = Date.now() - new Date(dateOfBirth).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      };

      return users
        .map(user => {
          const userJson = user.toJSON();
          const age = getAge(user.dateOfBirth);
          if (age < ageMin || age > ageMax) return null;

          // Calculate approximate distance
          if (currentUser.location.coordinates[0] !== 0 && currentUser.location.coordinates[1] !== 0 &&
              user.location.coordinates[0] !== 0 && user.location.coordinates[1] !== 0) {
            const [meLng, meLat] = currentUser.location.coordinates;
            const [uLng, uLat] = user.location.coordinates;
            const R = 6371; // Earth radius in km
            const dLat = ((uLat - meLat) * Math.PI) / 180;
            const dLon = ((uLng - meLng) * Math.PI) / 180;
            const a = Math.sin(dLat / 2) ** 2 +
                      Math.cos((meLat * Math.PI) / 180) *
                      Math.cos((uLat * Math.PI) / 180) *
                      Math.sin(dLon / 2) ** 2;
            userJson.distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
          }
          delete userJson.location;
          return userJson;
        })
        .filter(Boolean)
        .slice(0, 20);
    }
    return inMemoryDB.getDiscoverProfiles(currentUserId);
  },
  getNearbyMapUsers: async (currentUserId) => {
    if (useMongo) {
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) return [];
      const [meLng, meLat] = currentUser.location.coordinates;
      if (meLng === 0 && meLat === 0) return [];

      const users = await User.find({
        _id: { $ne: currentUserId },
        isActive: true,
        profileComplete: true,
      });

      return users.map(user => {
        const [uLng, uLat] = user.location.coordinates;
        return {
          _id: user._id,
          name: user.name,
          photos: user.photos,
          gender: user.gender,
          city: user.city,
          fuzzedLocation: {
            lat: uLat + (Math.random() - 0.5) * 0.02,
            lng: uLng + (Math.random() - 0.5) * 0.02,
          },
        };
      });
    }
    return inMemoryDB.getNearbyMapUsers(currentUserId);
  },

  // Swipe operations
  createSwipe: async (swiper, swiped, action) => {
    if (useMongo) {
      return await Swipe.create({ swiper, swiped, action });
    }
    return inMemoryDB.createSwipe(swiper, swiped, action);
  },
  findSwipe: async (swiper, swiped) => {
    if (useMongo) {
      return await Swipe.findOne({ swiper, swiped });
    }
    return inMemoryDB.findSwipe(swiper, swiped);
  },
  findReverseSwipe: async (swiper, swiped) => {
    if (useMongo) {
      return await Swipe.findOne({
        swiper: swiped,
        swiped: swiper,
        action: { $in: ['like', 'superlike'] }
      });
    }
    return inMemoryDB.findReverseSwipe(swiper, swiped);
  },

  // Match operations
  createMatch: async (userA, userB) => {
    if (useMongo) {
      return await Match.create({ users: [userA, userB] });
    }
    return inMemoryDB.createMatch(userA, userB);
  },
  getMatchesForUser: async (userId) => {
    if (useMongo) {
      const matches = await Match.find({
        users: userId,
        isActive: true
      }).sort({ updatedAt: -1 }).populate('lastMessage');

      // For each match, find the other user
      const matchesWithUsers = await Promise.all(matches.map(async match => {
        const otherUserId = match.users.find(id => id.toString() !== userId.toString());
        const otherUser = await User.findById(otherUserId);
        return {
          _id: match._id,
          matchedUser: otherUser ? otherUser.toJSON() : null,
          lastMessage: match.lastMessage,
          updatedAt: match.updatedAt
        };
      }));

      return matchesWithUsers;
    }
    return inMemoryDB.getMatchesForUser(userId);
  },
  findMatchById: async (id) => {
    if (useMongo) {
      return await Match.findById(id);
    }
    return inMemoryDB.findMatchById(id);
  },
  isMatchParticipant: async (matchId, userId) => {
    if (useMongo) {
      const match = await Match.findById(matchId);
      return match ? match.users.map(id => id.toString()).includes(userId.toString()) : false;
    }
    return inMemoryDB.isMatchParticipant(matchId, userId);
  },

  // Message operations
  createMessage: async (matchId, senderId, text) => {
    if (useMongo) {
      const message = await Message.create({ match: matchId, sender: senderId, text });
      // Update match lastMessage
      await Match.findByIdAndUpdate(matchId, { lastMessage: message._id });
      return message;
    }
    return inMemoryDB.createMessage(matchId, senderId, text);
  },
  getMessages: async (matchId) => {
    if (useMongo) {
      return await Message.find({ match: matchId }).sort({ createdAt: 1 });
    }
    return inMemoryDB.getMessages(matchId);
  },
  markMessagesRead: async (matchId, senderId) => {
    if (useMongo) {
      await Message.updateMany(
        { match: matchId, sender: { $ne: senderId } },
        { $set: { read: true } }
      );
    } else {
      inMemoryDB.markMessagesRead(matchId, senderId);
    }
  },

  // Story operations
  createStory: async (userId, mediaUrl, mediaType, caption) => {
    if (useMongo) {
      return await Story.create({ user: userId, mediaUrl, mediaType, caption });
    }
    return inMemoryDB.createStory(userId, mediaUrl, mediaType, caption);
  },
  getStories: async (userId) => {
    if (useMongo) {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return await Story.find({ createdAt: { $gte: oneDayAgo } }).populate('user', 'name photos');
    }
    return inMemoryDB.getStories(userId);
  },

  // Community operations
  getCommunities: async () => {
    if (useMongo) {
      return await Community.find();
    }
    return inMemoryDB.getCommunities();
  },
  joinCommunity: async (communityId, userId) => {
    if (useMongo) {
      return await Community.findByIdAndUpdate(
        communityId,
        { $addToSet: { members: userId } },
        { new: true }
      );
    }
    return inMemoryDB.joinCommunity(communityId, userId);
  },
  leaveCommunity: async (communityId, userId) => {
    if (useMongo) {
      return await Community.findByIdAndUpdate(
        communityId,
        { $pull: { members: userId } },
        { new: true }
      );
    }
    return inMemoryDB.leaveCommunity(communityId, userId);
  },

  // AI operations
  generateBio: async (interests, profession) => await aiService.generateBio(interests, profession),
  ratePhotos: async (photos) => await aiService.ratePhotos(photos),
  planDate: async (location) => await aiService.planDate(location),
  calculateLoveScore: async (user1, user2) => await aiService.calculateLoveScore(user1, user2)
};

module.exports = { db, setUseMongo };
