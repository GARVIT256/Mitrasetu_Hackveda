const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: function() { return !this.anonymous; },
    unique: true,
    sparse: true, // Allows multiple null values for anonymous users
  },
  password: {
    type: String,
    required: function() { return !this.anonymous; },
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  badges: {
    type: [String],
    default: [],
  },
  engagementScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
