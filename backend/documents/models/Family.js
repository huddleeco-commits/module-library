// backend/documents/models/Family.js
const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['admin', 'parent', 'child', 'member'],
    default: 'member'
  },
  avatar: String,
  dateOfBirth: Date,
  permissions: {
    canUpload: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: false },
    canShare: { type: Boolean, default: true },
    canViewAll: { type: Boolean, default: false }
  }
});

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  members: [familyMemberSchema],
  settings: {
    defaultCategory: {
      type: String,
      default: 'uncategorized'
    },
    autoSync: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    storageQuota: {
      type: Number,
      default: 5368709120 // 5GB in bytes
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Family', familySchema);
