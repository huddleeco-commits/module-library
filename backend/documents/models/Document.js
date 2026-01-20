// backend/documents/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['uncategorized', 'receipts', 'medical', 'school', 'warranties', 'insurance', 'recipes', 'general', 'legal', 'financial', 'personal'],
    default: 'uncategorized'
  },
  owner: {
    type: String,
    default: 'unknown'
  },
  extracted: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  extractedText: {
    type: String,
    default: ''
  },
  insights: [{
    type: {
      type: String
    },
    message: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  shares: [{
    documentId: mongoose.Schema.Types.ObjectId,
    token: String,
    sharedWith: [String],
    permissions: [String],
    expiryDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for common queries
documentSchema.index({ familyId: 1, category: 1 });
documentSchema.index({ familyId: 1, owner: 1 });
documentSchema.index({ familyId: 1, uploadDate: -1 });
documentSchema.index({ name: 'text', extractedText: 'text' });

module.exports = mongoose.model('Document', documentSchema);
