// Picks Routes - Enhanced for multiple bet types and game limits
const router = require('express').Router();
const { authenticateToken } = require('../middleware/auth.middleware');

module.exports = (picksController) => {
    // Existing routes - unchanged
    router.get('/weekly-games', picksController.getWeeklyGames.bind(picksController));
    router.post('/submit-picks', authenticateToken, picksController.submitPicks.bind(picksController));
    router.get('/line-movement/:gameId', picksController.getLineMovement.bind(picksController));
    
    // NEW routes for enhanced league features
    
    // Get games filtered by bet type
    router.get('/weekly-games/:betType', picksController.getWeeklyGamesByType.bind(picksController));
    
    // Get available props for the week
    router.get('/weekly-props', picksController.getWeeklyProps.bind(picksController));
    
    // Submit picks with validation for league rules
    router.post('/submit-league-picks', authenticateToken, picksController.submitLeaguePicks.bind(picksController));
    
    // Get moneyline odds for games
    router.get('/moneyline-odds/:week', picksController.getMoneylineOdds.bind(picksController));
    
    // Get over/under lines for games
    router.get('/totals/:week', picksController.getTotals.bind(picksController));
    
    return router;
};