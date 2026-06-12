const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Auth ──────────────────────────────────────────
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    // ── Basic Info ────────────────────────────────────
    name: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bio: { type: String, maxlength: 500, default: '' },
    photos: [{ type: String }], // array of file paths / URLs

    // ── Matrimonial Info ──────────────────────────────
    religion: { type: String, default: '' },
    caste: { type: String, default: '' },
    motherTongue: { type: String, default: '' },
    maritalStatus: {
      type: String,
      enum: ['never_married', 'divorced', 'widowed', 'separated', ''],
      default: '',
    },
    height: { type: Number, default: 0 }, // cm
    weight: { type: Number, default: 0 }, // kg
    education: { type: String, default: '' },
    occupation: { type: String, default: '' },
    annualIncome: { type: String, default: '' },
    familyType: { type: String, enum: ['joint', 'nuclear', ''], default: '' },
    familyStatus: { type: String, default: '' },
    diet: { type: String, enum: ['vegetarian', 'non_vegetarian', 'vegan', ''], default: '' },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    hobbies: [{ type: String }],

    // ── Location ──────────────────────────────────────
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },

    // ── Preferences ───────────────────────────────────
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 50 },
      distanceKm: { type: Number, default: 100 },
      genders: { type: [String], default: ['male', 'female', 'other'] },
      religions: { type: [String], default: [] },
      maritalStatuses: { type: [String], default: [] },
    },

    // ── Profile Completion ────────────────────────────
    profileComplete: { type: Boolean, default: false },
    profileCompletionStep: { type: Number, default: 0 },

    // ── Premium ───────────────────────────────────────
    isPremium: { type: Boolean, default: false },
    likesLeft: { type: Number, default: 999 }, // unlimited for now
    superLikesLeft: { type: Number, default: 5 },

    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Geospatial index
userSchema.index({ location: '2dsphere' });

// Virtual: age
userSchema.virtual('age').get(function () {
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
