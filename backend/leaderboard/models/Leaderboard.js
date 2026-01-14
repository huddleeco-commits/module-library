// Leaderboard Model for Claude AI Pickem System
// C:\Users\Redhe\OneDrive\Documents\Desktop\LifeOS-Industries\PickemSystem\models\Leaderboard.js

const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    // Leaderboard Type and Period
    leaderboardType: {
        type: String,
        enum: ['season', 'weekly', 'monthly', 'playoff'],
        default: 'season',
        required: true
    },
    season: {
        type: Number,
        required: [true, 'Season is required'],
        default: 2025,
        min: [2020, 'Season must be 2020 or later']
    },
    week: {
        type: Number,
        default: null, // null = season leaderboard, number = weekly leaderboard
        min: [1, 'Week must be between 1 and 18'],
        max: [18, 'Week must be between 1 and 18']
    },
    month: {
        type: Number,
        default: null, // For monthly leaderboards
        min: [1, 'Month must be between 1 and 12'],
        max: [12, 'Month must be between 1 and 12']
    },

    // Leaderboard Rankings
    rankings: [{
        rank: {
            type: Number,
            required: true,
            min: 1
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        displayName: {
            type: String,
            required: true
        },
        
        // Core Statistics
        stats: {
            totalPicks: {
                type: Number,
                required: true,
                min: 0
            },
            correctPicks: {
                type: Number,
                required: true,
                min: 0
            },
            incorrectPicks: {
                type: Number,
                default: 0,
                min: 0
            },
            pushes: {
                type: Number,
                default: 0,
                min: 0
            },
            winRate: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            weeksPlayed: {
                type: Number,
                default: 0,
                min: 0
            },
            bestWeek: {
                type: String,
                default: '0-0',
                match: [/^\d+-\d+(-\d+)?$/, 'Best week must be in format W-L or W-L-P']
            },
            worstWeek: {
                type: String,
                default: '0-0',
                match: [/^\d+-\d+(-\d+)?$/, 'Worst week must be in format W-L or W-L-P']
            },
            currentStreak: {
                type: Number,
                default: 0
            },
            bestStreak: {
                type: Number,
                default: 0,
                min: 0
            },
            points: {
                type: Number,
                default: 0,
                min: 0
            }
        },
        
        // Claude AI Analytics
        claudeStats: {
            averageConfidence: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            totalQualityScore: {
                type: Number,
                default: 0,
                min: 0
            },
            averageQualityScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 10
            },
            sharpMoneySuccess: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            injuryPredictionAccuracy: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            },
            lineMovementSuccess: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        
        // Achievement Badges
        badges: [{
            name: {
                type: String,
                enum: [
                    'champion', 'runner-up', 'top-3', 'top-10',
                    'sharp-eye', 'consistency', 'hot-streak', 'comeback-kid',
                    'perfect-week', 'iron-man', 'early-bird', 'claude-master',
                    'sharp-money-expert', 'injury-oracle', 'line-reader'
                ]
            },
            description: String,
            earnedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Performance Trends
        trend: {
            direction: {
                type: String,
                enum: ['up', 'down', 'same'],
                default: 'same'
            },
            change: {
                type: Number,
                default: 0
            },
            lastWeekRank: {
                type: Number,
                default: null
            },
            momentum: {
                type: String,
                enum: ['hot', 'cold', 'steady'],
                default: 'steady'
            }
        },
        
        // Tier Classification
        tier: {
            type: String,
            enum: ['elite', 'pro', 'advanced', 'intermediate', 'beginner'],
            default: 'beginner'
        },
        
        // Last Activity
        lastActivity: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Leaderboard Metadata
    metadata: {
        totalPlayers: {
            type: Number,
            required: true,
            min: 0
        },
        totalPicks: {
            type: Number,
            default: 0,
            min: 0
        },
        averageWinRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        medianWinRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        topWinRate: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        averageQualityScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },
        totalWeeksCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        weekComplete: {
            type: Boolean,
            default: false
        }
    },
    
    // Leaderboard Status
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    },
    
    // Audit Trail
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for Performance
leaderboardSchema.index({ season: 1, leaderboardType: 1, week: 1 }, { unique: true });
leaderboardSchema.index({ season: -1, leaderboardType: 1 });
leaderboardSchema.index({ 'rankings.rank': 1 });
leaderboardSchema.index({ 'rankings.userId': 1 });
leaderboardSchema.index({ status: 1 });
leaderboardSchema.index({ 'metadata.lastUpdated': -1 });

// Pre-save Middleware
leaderboardSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    this.metadata.lastUpdated = Date.now();
    this.metadata.totalPlayers = this.rankings.length;
    
    if (this.rankings.length > 0) {
        // Calculate metadata statistics
        const winRates = this.rankings.map(r => r.stats.winRate);
        const qualityScores = this.rankings.map(r => r.claudeStats.averageQualityScore || 0);
        const totalPicks = this.rankings.reduce((sum, r) => sum + r.stats.totalPicks, 0);
        
        this.metadata.totalPicks = totalPicks;
        this.metadata.averageWinRate = parseFloat((winRates.reduce((sum, rate) => sum + rate, 0) / winRates.length).toFixed(1));
        this.metadata.topWinRate = Math.max(...winRates);
        this.metadata.averageQualityScore = parseFloat((qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length).toFixed(1));
        
        // Calculate median win rate
        const sortedWinRates = winRates.sort((a, b) => a - b);
        const mid = Math.floor(sortedWinRates.length / 2);
        this.metadata.medianWinRate = sortedWinRates.length % 2 !== 0
            ? sortedWinRates[mid]
            : parseFloat(((sortedWinRates[mid - 1] + sortedWinRates[mid]) / 2).toFixed(1));
    }
    
    next();
});

// Instance Methods

// Add or update a user's ranking
leaderboardSchema.methods.updateUserRanking = function(userStats) {
    const existingIndex = this.rankings.findIndex(r => r.userId.toString() === userStats.userId.toString());
    
    const ranking = {
        rank: 0, // Will be calculated during sort
        userId: userStats.userId,
        username: userStats.username,
        displayName: userStats.displayName,
        stats: userStats.stats,
        claudeStats: userStats.claudeStats || {},
        badges: userStats.badges || [],
        tier: this.calculateTier(userStats.stats.winRate, userStats.stats.weeksPlayed),
        lastActivity: new Date()
    };
    
    if (existingIndex >= 0) {
        // Update existing ranking
        ranking.trend = this.calculateTrend(this.rankings[existingIndex], ranking);
        this.rankings[existingIndex] = ranking;
    } else {
        // Add new ranking
        ranking.trend = { direction: 'same', change: 0, momentum: 'steady' };
        this.rankings.push(ranking);
    }
    
    // Resort and update ranks
    this.sortAndRankUsers();
    return this.save();
};

// Sort users and assign ranks
leaderboardSchema.methods.sortAndRankUsers = function() {
    // Sort by win rate, then correct picks, then points
    this.rankings.sort((a, b) => {
        if (b.stats.winRate !== a.stats.winRate) return b.stats.winRate - a.stats.winRate;
        if (b.stats.correctPicks !== a.stats.correctPicks) return b.stats.correctPicks - a.stats.correctPicks;
        if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
        return b.claudeStats.averageQualityScore - a.claudeStats.averageQualityScore;
    });
    
    // Assign ranks
    this.rankings.forEach((ranking, index) => {
        ranking.rank = index + 1;
    });
};

// Calculate user tier based on performance
leaderboardSchema.methods.calculateTier = function(winRate, weeksPlayed) {
    if (weeksPlayed < 3) return 'beginner';
    if (winRate >= 70) return 'elite';
    if (winRate >= 60) return 'pro';
    if (winRate >= 50) return 'advanced';
    if (winRate >= 40) return 'intermediate';
    return 'beginner';
};

// Calculate performance trend
leaderboardSchema.methods.calculateTrend = function(oldRanking, newRanking) {
    const trend = {
        direction: 'same',
        change: 0,
        lastWeekRank: oldRanking.rank,
        momentum: 'steady'
    };
    
    if (oldRanking.rank > newRanking.rank) {
        trend.direction = 'up';
        trend.change = oldRanking.rank - newRanking.rank;
    } else if (oldRanking.rank < newRanking.rank) {
        trend.direction = 'down';
        trend.change = newRanking.rank - oldRanking.rank;
    }
    
    // Calculate momentum based on recent performance
    const oldWinRate = oldRanking.stats.winRate;
    const newWinRate = newRanking.stats.winRate;
    
    if (newWinRate > oldWinRate + 5) trend.momentum = 'hot';
    else if (newWinRate < oldWinRate - 5) trend.momentum = 'cold';
    else trend.momentum = 'steady';
    
    return trend;
};

// Award badges based on performance
leaderboardSchema.methods.awardBadges = function(userId) {
    const userRanking = this.rankings.find(r => r.userId.toString() === userId.toString());
    if (!userRanking) return;
    
    const badges = [];
    
    // Rank-based badges
    if (userRanking.rank === 1) badges.push({ name: 'champion', description: 'Season Champion' });
    else if (userRanking.rank === 2) badges.push({ name: 'runner-up', description: 'Season Runner-up' });
    else if (userRanking.rank <= 3) badges.push({ name: 'top-3', description: 'Top 3 Finish' });
    else if (userRanking.rank <= 10) badges.push({ name: 'top-10', description: 'Top 10 Finish' });
    
    // Performance-based badges
    if (userRanking.stats.winRate >= 70) badges.push({ name: 'sharp-eye', description: 'Elite Win Rate (70%+)' });
    if (userRanking.stats.weeksPlayed >= 15) badges.push({ name: 'iron-man', description: 'Played 15+ Weeks' });
    if (userRanking.stats.currentStreak >= 5) badges.push({ name: 'hot-streak', description: '5+ Week Win Streak' });
    
    // Claude AI specific badges
    if (userRanking.claudeStats.averageQualityScore >= 8) badges.push({ name: 'claude-master', description: 'Master of AI Analysis' });
    if (userRanking.claudeStats.sharpMoneySuccess >= 70) badges.push({ name: 'sharp-money-expert', description: 'Sharp Money Expert' });
    if (userRanking.claudeStats.injuryPredictionAccuracy >= 80) badges.push({ name: 'injury-oracle', description: 'Injury Prediction Master' });
    
    // Update user's badges (only add new ones)
    badges.forEach(newBadge => {
        const exists = userRanking.badges.some(existing => existing.name === newBadge.name);
        if (!exists) {
            userRanking.badges.push(newBadge);
        }
    });
};

// Get user's position and stats
leaderboardSchema.methods.getUserPosition = function(userId) {
    const userRanking = this.rankings.find(r => r.userId.toString() === userId.toString());
    if (!userRanking) return null;
    
    return {
        rank: userRanking.rank,
        totalPlayers: this.rankings.length,
        percentile: Math.round(((this.rankings.length - userRanking.rank + 1) / this.rankings.length) * 100),
        tier: userRanking.tier,
        trend: userRanking.trend,
        stats: userRanking.stats,
        badges: userRanking.badges
    };
};

// Static Methods

// Create or update leaderboard for a specific period
leaderboardSchema.statics.updateLeaderboard = async function(leaderboardType, season = 2024, week = null) {
    try {
        const WeeklyPicks = mongoose.model('WeeklyPicks');
        const User = mongoose.model('User');
        
        // Build aggregation pipeline based on leaderboard type
        const matchStage = { season: season, status: 'scored' };
        if (leaderboardType === 'weekly' && week) {
            matchStage.week = week;
        }
        
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    displayName: { $first: '$displayName' },
                    totalPicks: { $sum: '$summary.totalPicks' },
                    correctPicks: { $sum: '$summary.correctPicks' },
                    incorrectPicks: { $sum: '$summary.incorrectPicks' },
                    pushes: { $sum: '$summary.pushes' },
                    weeksPlayed: { $sum: 1 },
                    points: { $sum: '$summary.points' },
                    bestWeekScore: { $max: '$summary.correctPicks' },
                    worstWeekScore: { $min: '$summary.correctPicks' },
                    totalConfidence: { $sum: '$claudeAnalysis.totalConfidence' },
                    totalQualityScore: { $sum: '$claudeAnalysis.qualityScore' },
                    sharpMoneyGames: { $sum: '$claudeAnalysis.sharpMoneyGames' },
                    lineMovementGames: { $sum: '$claudeAnalysis.lineMovementGames' },
                    injuryImpactGames: { $sum: '$claudeAnalysis.injuryImpactGames' }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: {
                            if: { $gt: ['$totalPicks', 0] },
                            then: { $multiply: [{ $divide: ['$correctPicks', '$totalPicks'] }, 100] },
                            else: 0
                        }
                    },
                    averageConfidence: {
                        $cond: {
                            if: { $gt: ['$totalPicks', 0] },
                            then: { $divide: ['$totalConfidence', '$totalPicks'] },
                            else: 0
                        }
                    },
                    averageQualityScore: {
                        $cond: {
                            if: { $gt: ['$weeksPlayed', 0] },
                            then: { $divide: ['$totalQualityScore', '$weeksPlayed'] },
                            else: 0
                        }
                    }
                }
            },
            {
                $sort: { winRate: -1, correctPicks: -1, points: -1 }
            }
        ];
        
        const userStats = await WeeklyPicks.aggregate(pipeline);
        
        // Get user details for badges and streaks
        const userIds = userStats.map(stat => stat._id);
        const users = await User.find({ _id: { $in: userIds } });
        const userMap = users.reduce((map, user) => {
            map[user._id.toString()] = user;
            return map;
        }, {});
        
        // Build rankings array
        const rankings = userStats.map((stat, index) => {
            const user = userMap[stat._id.toString()];
            return {
                rank: index + 1,
                userId: stat._id,
                username: stat.username,
                displayName: stat.displayName,
                stats: {
                    totalPicks: stat.totalPicks,
                    correctPicks: stat.correctPicks,
                    incorrectPicks: stat.incorrectPicks,
                    pushes: stat.pushes,
                    winRate: parseFloat(stat.winRate.toFixed(1)),
                    weeksPlayed: stat.weeksPlayed,
                    bestWeek: `${stat.bestWeekScore || 0}-${5 - (stat.bestWeekScore || 0)}`,
                    worstWeek: `${stat.worstWeekScore || 0}-${5 - (stat.worstWeekScore || 0)}`,
                    currentStreak: user ? user.seasonStats.currentStreak : 0,
                    bestStreak: user ? user.seasonStats.bestStreak : 0,
                    points: Math.round(stat.points)
                },
                claudeStats: {
                    averageConfidence: parseFloat(stat.averageConfidence.toFixed(1)),
                    totalQualityScore: stat.totalQualityScore,
                    averageQualityScore: parseFloat(stat.averageQualityScore.toFixed(1)),
                    sharpMoneySuccess: stat.sharpMoneyGames > 0 ? Math.round((stat.sharpMoneyGames / stat.weeksPlayed) * 100) : 0,
                    injuryPredictionAccuracy: stat.injuryImpactGames > 0 ? Math.round((stat.injuryImpactGames / stat.weeksPlayed) * 100) : 0,
                    lineMovementSuccess: stat.lineMovementGames > 0 ? Math.round((stat.lineMovementGames / stat.weeksPlayed) * 100) : 0
                },
                badges: user ? user.badges.filter(badge => badge.season === season) : [],
                tier: calculateTier(stat.winRate, stat.weeksPlayed),
                trend: { direction: 'same', change: 0, momentum: 'steady' },
                lastActivity: new Date()
            };
        });
        
        // Create or update leaderboard
        const leaderboard = await this.findOneAndUpdate(
            { season: season, leaderboardType: leaderboardType, week: week },
            {
                season: season,
                leaderboardType: leaderboardType,
                week: week,
                rankings: rankings,
                metadata: {
                    totalPlayers: rankings.length,
                    weekComplete: leaderboardType === 'weekly'
                },
                status: 'active'
            },
            { upsert: true, new: true }
        );
        
        // Award badges for season leaderboard
        if (leaderboardType === 'season') {
            rankings.forEach(ranking => {
                leaderboard.awardBadges(ranking.userId);
            });
            await leaderboard.save();
        }
        
        return leaderboard;
        
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        throw error;
    }
};

// Get current season leaderboard
leaderboardSchema.statics.getCurrentSeasonLeaderboard = async function(season = 2024, limit = 50) {
    return this.findOne({
        season: season,
        leaderboardType: 'season'
    })
    .slice('rankings', limit);
};

// Get weekly leaderboard
leaderboardSchema.statics.getWeeklyLeaderboard = async function(week, season = 2024, limit = 50) {
    return this.findOne({
        season: season,
        leaderboardType: 'weekly',
        week: week
    })
    .slice('rankings', limit);
};

// Helper function for tier calculation
function calculateTier(winRate, weeksPlayed) {
    if (weeksPlayed < 3) return 'beginner';
    if (winRate >= 70) return 'elite';
    if (winRate >= 60) return 'pro';
    if (winRate >= 50) return 'advanced';
    if (winRate >= 40) return 'intermediate';
    return 'beginner';
}

// Export the model
module.exports = mongoose.model('Leaderboard', leaderboardSchema);