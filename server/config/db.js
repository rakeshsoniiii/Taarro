// ── In-Memory Database ────────────────────────────────────────────────────────
// Replaces MongoDB/Mongoose. All data lives in RAM for this session.
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ── Seed Data ─────────────────────────────────────────────────────────────────
const seedUsers = [
  {
    _id: 'seed-1',
    email: 'ananya@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Ananya Sharma',
    dateOfBirth: new Date('2000-05-15'),
    gender: 'female',
    bio: 'Software engineer at a tech startup. Love hiking, cooking, and filter coffee. Looking for someone family-oriented and progressive. 🌸',
    photos: [],
    religion: 'Hindu',
    caste: 'Brahmin',
    motherTongue: 'Hindi',
    maritalStatus: 'never_married',
    height: 165,
    weight: 55,
    education: "Bachelor's",
    occupation: 'Engineer',
    annualIncome: '10-20 LPA',
    familyType: 'nuclear',
    diet: 'vegetarian',
    hobbies: ['Cooking', 'Travelling', 'Yoga'],
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 22, ageMax: 35, distanceKm: 100, genders: ['male'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-2',
    email: 'priya@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Priya Patel',
    dateOfBirth: new Date('1998-08-22'),
    gender: 'female',
    bio: "Pediatrician by profession, dancer by heart. Love exploring new cafes and reading historical fiction. Let's grab a chai! ☕💃",
    photos: [],
    religion: 'Hindu',
    caste: 'Patel',
    motherTongue: 'Gujarati',
    maritalStatus: 'never_married',
    height: 160,
    weight: 52,
    education: 'Professional Degree (MD/JD)',
    occupation: 'Doctor',
    annualIncome: '20-40 LPA',
    familyType: 'joint',
    diet: 'vegetarian',
    hobbies: ['Dancing', 'Reading', 'Travelling'],
    location: { type: 'Point', coordinates: [72.8800, 19.0800] },
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 24, ageMax: 35, distanceKm: 50, genders: ['male'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-3',
    email: 'amina@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Amina Khan',
    dateOfBirth: new Date('1999-11-02'),
    gender: 'female',
    bio: 'Interior designer. Creative, passionate about sustainable living, and amateur photographer. Looking for an honest, kind soul. ✨',
    photos: [],
    religion: 'Muslim',
    caste: 'Pathan',
    motherTongue: 'Urdu',
    maritalStatus: 'never_married',
    height: 162,
    weight: 50,
    education: "Bachelor's",
    occupation: 'Artist/Creative',
    annualIncome: '6-10 LPA',
    familyType: 'nuclear',
    diet: 'non_vegetarian',
    hobbies: ['Photography', 'Art', 'Music'],
    location: { type: 'Point', coordinates: [72.8500, 19.0500] },
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 22, ageMax: 32, distanceKm: 100, genders: ['male'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-4',
    email: 'rahul@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Rahul Verma',
    dateOfBirth: new Date('1996-03-10'),
    gender: 'male',
    bio: "Finance analyst. Weekend trekker, fitness enthusiast, and absolute foodie. Looking for a partner to share life's simple adventures.",
    photos: [],
    religion: 'Hindu',
    caste: 'Kshatriya',
    motherTongue: 'Hindi',
    maritalStatus: 'never_married',
    height: 178,
    weight: 74,
    education: "Master's",
    occupation: 'Finance',
    annualIncome: '20-40 LPA',
    familyType: 'nuclear',
    diet: 'non_vegetarian',
    hobbies: ['Fitness', 'Travelling', 'Movies'],
    location: { type: 'Point', coordinates: [72.8777, 19.0760] },
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 22, ageMax: 30, distanceKm: 100, genders: ['female'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-5',
    email: 'kabir@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Kabir Singh',
    dateOfBirth: new Date('1995-12-18'),
    gender: 'male',
    bio: "IT consultant, gamer, and puppy dad. I enjoy guitar, outdoor runs, and deep conversations. Let's connect! 🎸",
    photos: [],
    religion: 'Sikh',
    caste: 'Jat',
    motherTongue: 'Punjabi',
    maritalStatus: 'never_married',
    height: 182,
    weight: 80,
    education: "Bachelor's",
    occupation: 'IT/Tech',
    annualIncome: '10-20 LPA',
    familyType: 'nuclear',
    diet: 'non_vegetarian',
    hobbies: ['Gaming', 'Music', 'Fitness'],
    location: { type: 'Point', coordinates: [72.9000, 19.1000] },
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 22, ageMax: 30, distanceKm: 100, genders: ['female'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-6',
    email: 'deepika@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Deepika Reddy',
    dateOfBirth: new Date('1997-01-05'),
    gender: 'female',
    bio: 'Marketing Lead. Yoga practitioner, badminton player, and dog lover. Believe in positive vibes and simple joys. 🧘‍♀️🐾',
    photos: [],
    religion: 'Hindu',
    caste: 'Saraswat',
    motherTongue: 'Kannada',
    maritalStatus: 'never_married',
    height: 173,
    weight: 58,
    education: "Bachelor's",
    occupation: 'Sales/Marketing',
    annualIncome: '20-40 LPA',
    familyType: 'nuclear',
    diet: 'vegetarian',
    hobbies: ['Yoga', 'Travelling', 'Fitness'],
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 26, ageMax: 35, distanceKm: 100, genders: ['male'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: 'seed-7',
    email: 'arjun@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'Arjun Mehta',
    dateOfBirth: new Date('1994-06-25'),
    gender: 'male',
    bio: 'Entrepreneur running a sustainable design studio. Travel junkie and experimental cook. Looking for a mature and passionate partner.',
    photos: [],
    religion: 'Hindu',
    caste: 'Shah',
    motherTongue: 'Gujarati',
    maritalStatus: 'never_married',
    height: 175,
    weight: 70,
    education: "Master's",
    occupation: 'Business Owner',
    annualIncome: '40+ LPA',
    familyType: 'nuclear',
    diet: 'vegetarian',
    hobbies: ['Cooking', 'Art', 'Travelling'],
    location: { type: 'Point', coordinates: [77.6200, 12.9300] },
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    profileComplete: true,
    profileCompletionStep: 5,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 22, ageMax: 32, distanceKm: 100, genders: ['female'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Seed communities
const seedCommunities = [
  { _id: 'comm-1', name: 'Engineers', description: 'For tech enthusiasts and engineers', icon: '👨‍💻', members: [] },
  { _id: 'comm-2', name: 'Doctors', description: 'For medical professionals', icon: '👨‍⚕️', members: [] },
  { _id: 'comm-3', name: 'Entrepreneurs', description: 'For business owners and startup founders', icon: '🚀', members: [] },
  { _id: 'comm-4', name: 'Gamers', description: 'For video game lovers', icon: '🎮', members: [] },
  { _id: 'comm-5', name: 'Anime', description: 'For anime and manga fans', icon: '🌸', members: [] },
  { _id: 'comm-6', name: 'Fitness', description: 'For fitness enthusiasts', icon: '💪', members: [] }
];

// ── In-Memory Collections ─────────────────────────────────────────────────────
const db = {
  users: [...seedUsers],
  swipes: [],
  matches: [],
  messages: [],
  stories: [],
  communities: [...seedCommunities]
};

// ── Helper: get virtual age ───────────────────────────────────────────────────
const getAge = (dateOfBirth) => {
  const diff = Date.now() - new Date(dateOfBirth).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

// ── Helper: sanitize user (remove password) ───────────────────────────────────
const sanitize = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  rest.age = getAge(rest.dateOfBirth);
  return rest;
};

// ── User CRUD ─────────────────────────────────────────────────────────────────
db.findUserById = (id) => db.users.find(u => u._id === id) || null;
db.findUserByEmail = (email) => db.users.find(u => u.email === email.toLowerCase()) || null;

db.createUser = async ({ name, email, password, dateOfBirth, gender }) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = {
    _id: uuidv4(),
    email: email.toLowerCase(),
    password: hashed,
    name,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    bio: '',
    photos: [],
    religion: '',
    caste: '',
    motherTongue: '',
    maritalStatus: 'never_married',
    height: 0,
    weight: 0,
    education: '',
    occupation: '',
    annualIncome: '',
    familyType: '',
    diet: '',
    hobbies: [],
    location: { type: 'Point', coordinates: [0, 0] },
    city: '',
    state: '',
    country: 'India',
    profileComplete: false,
    profileCompletionStep: 0,
    isActive: true,
    lastSeen: new Date(),
    isPremium: false,
    preferences: { ageMin: 18, ageMax: 50, distanceKm: 100, genders: ['male', 'female', 'other'], religions: [] },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.users.push(user);
  return sanitize(user);
};

db.updateUser = (id, updates) => {
  const idx = db.users.findIndex(u => u._id === id);
  if (idx === -1) return null;
  db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date() };
  return sanitize(db.users[idx]);
};

db.matchPassword = async (user, enteredPassword) => {
  return bcrypt.compare(enteredPassword, user.password);
};

// ── Discover ──────────────────────────────────────────────────────────────────
db.getDiscoverProfiles = (currentUserId) => {
  const currentUser = db.findUserById(currentUserId);
  if (!currentUser) return [];

  // Get already-swiped IDs
  const swipedIds = db.swipes
    .filter(s => s.swiper === currentUserId)
    .map(s => s.swiped);

  const excluded = new Set([...swipedIds, currentUserId]);
  const { ageMin, ageMax, genders, religions } = currentUser.preferences;

  return db.users
    .filter(u => {
      if (excluded.has(u._id)) return false;
      if (!u.profileComplete || !u.isActive) return false;
      const age = getAge(u.dateOfBirth);
      if (age < ageMin || age > ageMax) return false;
      if (genders && genders.length && !genders.includes(u.gender)) return false;
      if (religions && religions.length && !religions.includes(u.religion)) return false;
      return true;
    })
    .map(u => {
      const obj = sanitize(u);
      // Calculate approximate distance if both have coords
      const [meLng, meLat] = currentUser.location.coordinates;
      const [uLng, uLat] = u.location.coordinates;
      if ((meLng !== 0 || meLat !== 0) && (uLng !== 0 || uLat !== 0)) {
        const R = 6371;
        const dLat = ((uLat - meLat) * Math.PI) / 180;
        const dLon = ((uLng - meLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((meLat * Math.PI) / 180) * Math.cos((uLat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
        obj.distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      }
      delete obj.location;
      return obj;
    })
    .slice(0, 20);
};

db.getNearbyMapUsers = (currentUserId) => {
  const currentUser = db.findUserById(currentUserId);
  if (!currentUser) return [];
  const [meLng, meLat] = currentUser.location.coordinates;
  if (meLng === 0 && meLat === 0) return [];

  return db.users
    .filter(u => u._id !== currentUserId && u.isActive && u.profileComplete)
    .map(u => {
      const [uLng, uLat] = u.location.coordinates;
      return {
        _id: u._id,
        name: u.name,
        photos: u.photos,
        gender: u.gender,
        city: u.city,
        fuzzedLocation: {
          lat: uLat + (Math.random() - 0.5) * 0.02,
          lng: uLng + (Math.random() - 0.5) * 0.02,
        },
      };
    });
};

// ── Swipes ────────────────────────────────────────────────────────────────────
db.createSwipe = (swiper, swiped, action) => {
  const swipe = { _id: uuidv4(), swiper, swiped, action, createdAt: new Date() };
  db.swipes.push(swipe);
  return swipe;
};

db.findSwipe = (swiper, swiped) => db.swipes.find(s => s.swiper === swiper && s.swiped === swiped) || null;

db.findReverseSwipe = (swiper, swiped) =>
  db.swipes.find(s => s.swiper === swiped && s.swiped === swiper && ['like', 'superlike'].includes(s.action)) || null;

// ── Matches ───────────────────────────────────────────────────────────────────
db.createMatch = (userA, userB) => {
  const match = {
    _id: uuidv4(),
    users: [userA, userB],
    lastMessage: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  db.matches.push(match);
  return match;
};

db.getMatchesForUser = (userId) => {
  return db.matches
    .filter(m => m.isActive && m.users.includes(userId))
    .map(m => {
      const otherId = m.users.find(id => id !== userId);
      const other = sanitize(db.findUserById(otherId));
      const lastMsg = m.lastMessage
        ? db.messages.find(msg => msg._id === m.lastMessage) || null
        : null;
      return {
        _id: m._id,
        matchedUser: other,
        lastMessage: lastMsg,
        updatedAt: m.updatedAt,
      };
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
};

db.findMatchById = (id) => db.matches.find(m => m._id === id) || null;

db.isMatchParticipant = (matchId, userId) => {
  const match = db.findMatchById(matchId);
  return match ? match.users.includes(userId) : false;
};

// ── Messages ──────────────────────────────────────────────────────────────────
db.createMessage = (matchId, senderId, text) => {
  const msg = {
    _id: uuidv4(),
    match: matchId,
    sender: senderId,
    text,
    read: false,
    createdAt: new Date(),
  };
  db.messages.push(msg);
  // Update match lastMessage
  const match = db.findMatchById(matchId);
  if (match) {
    match.lastMessage = msg._id;
    match.updatedAt = new Date();
  }
  return msg;
};

db.getMessages = (matchId) =>
  db.messages.filter(m => m.match === matchId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

db.markMessagesRead = (matchId, senderId) => {
  db.messages.forEach(m => {
    if (m.match === matchId && m.sender !== senderId) m.read = true;
  });
};

// ── Stories ──────────────────────────────────────────────────────────────────
db.createStory = (userId, mediaUrl, mediaType, caption) => {
  const story = {
    _id: uuidv4(),
    user: userId,
    mediaUrl,
    mediaType: mediaType || 'image',
    caption,
    createdAt: new Date()
  };
  db.stories.push(story);
  return story;
};

db.getStories = (userId) => {
  // Get stories from all users except the current user (or include? Let's include all)
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  return db.stories.filter(s => (now - new Date(s.createdAt).getTime()) < oneDay);
};

// ── Communities ─────────────────────────────────────────────────────────────
db.getCommunities = () => db.communities;
db.joinCommunity = (communityId, userId) => {
  const community = db.communities.find(c => c._id === communityId);
  if (community && !community.members.includes(userId)) {
    community.members.push(userId);
  }
  return community;
};
db.leaveCommunity = (communityId, userId) => {
  const community = db.communities.find(c => c._id === communityId);
  if (community) {
    community.members = community.members.filter(id => id !== userId);
  }
  return community;
};

module.exports = db;
