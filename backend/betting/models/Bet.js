const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
    challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    amount: Number,
    status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
    gameId: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bet', BetSchema);