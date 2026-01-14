const mongoose = require('mongoose');

const pickSchema = new mongoose.Schema({
    platformId: { type: String, required: true },
    userId: { type: String, required: true }, // Changed to String to handle platform-generated IDs
    week: { type: Number, required: true },
    picks: [{
        gameId: String,
        team: String,
        line: String,
        odds: String,
        gameTime: Date,
        lockedAt: Date,
        result: { type: String, enum: ['pending', 'win', 'loss', 'push'], default: 'pending' }
    }],
    submittedAt: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    pushes: { type: Number, default: 0 },
    processed: { type: Boolean, default: false }
});

pickSchema.index({ platformId: 1, userId: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('Pick', pickSchema);