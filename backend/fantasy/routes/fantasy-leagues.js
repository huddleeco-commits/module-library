const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Fantasy League Management Routes
module.exports = (app) => {
    // Get league details
    app.get('/api/fantasy/leagues/:leagueId', async (req, res) => {
        try {
            const { leagueId } = req.params;
            
            // For now, return mock data - will connect to database later
            const league = {
                id: leagueId,
                name: 'Fantasy Football League',
                platformId: req.query.platformId,
                commissioner: req.user?.id || 'admin',
                teams: [],
                settings: {
                    maxTeams: 12,
                    scoringType: 'ppr',
                    draftDate: null,
                    playoffWeeks: [15, 16, 17]
                },
                status: 'pre-draft'
            };
            
            res.json({ success: true, league });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Create new league
    app.post('/api/fantasy/leagues/create', async (req, res) => {
        try {
            const { name, settings, platformId } = req.body;
            const leagueId = `league_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Would save to database here
            const newLeague = {
                id: leagueId,
                name,
                platformId,
                commissioner: req.user?.id || 'admin',
                settings,
                created: new Date()
            };
            
            res.json({ 
                success: true, 
                leagueId,
                joinCode: Math.random().toString(36).substr(2, 6).toUpperCase()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Join league
    app.post('/api/fantasy/leagues/:leagueId/join', async (req, res) => {
        try {
            const { leagueId } = req.params;
            const { teamName, userId } = req.body;
            
            // Would update database here
            res.json({ 
                success: true, 
                message: 'Successfully joined league',
                teamId: `team_${Date.now()}`
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Get league standings
    app.get('/api/fantasy/leagues/:leagueId/standings', async (req, res) => {
        try {
            const standings = [
                { rank: 1, teamName: 'Team Alpha', owner: 'User1', wins: 10, losses: 3, points: 1250 },
                { rank: 2, teamName: 'Team Beta', owner: 'User2', wins: 9, losses: 4, points: 1200 }
            ];
            
            res.json({ success: true, standings });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Get league transactions
    app.get('/api/fantasy/leagues/:leagueId/transactions', async (req, res) => {
        try {
            const transactions = [];
            res.json({ success: true, transactions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Update league settings (commissioner only)
    app.put('/api/fantasy/leagues/:leagueId/settings', async (req, res) => {
        try {
            const { settings } = req.body;
            // Would verify commissioner status and update database
            res.json({ success: true, message: 'Settings updated' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ESPN sync endpoint
    app.post('/api/fantasy/espn/sync', async (req, res) => {
        const { leagueId, cookies } = req.body;
        
        try {
            const fetch = require('node-fetch');
            
            // ESPN requires these specific headers for their API
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Referer': 'https://fantasy.espn.com/',
                'x-fantasy-source': 'kona',
                'x-fantasy-platform': 'kona-PROD-6daa0c818b5e9d0f3c6ce2c96e2a6e5da8b5f5e1'
            };
            
            // Add cookies if provided (for private leagues)
            if (cookies) {
                headers['Cookie'] = `espn_s2=${cookies.espn_s2}; SWID=${cookies.swid}`;
            }
            
            // Get comprehensive league data including settings and roster configuration
            const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mSettings&view=mStatus&view=kona_player_info&view=mLiveScoring&view=mPositionalRatings&scoringPeriodId=1`;
            
            console.log(`Fetching ESPN league ${leagueId} with projections...`);
            
            const response = await fetch(url, { 
                method: 'GET',
                headers: headers 
            });
            
            const responseText = await response.text();
            
            // Check if we got HTML instead of JSON (means redirect/error)
            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                console.log('Got HTML response - trying 2024 season as fallback');
                
                // Try 2024 as fallback
                const url2024 = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mMatchup&view=mSettings&view=mStatus&view=kona_player_info&scoringPeriodId=1`;
                const response2024 = await fetch(url2024, { method: 'GET', headers: headers });
                const responseText2024 = await response2024.text();
                
                if (responseText2024.includes('<!DOCTYPE') || responseText2024.includes('<html')) {
                    return res.json({ 
                        success: false, 
                        error: 'League not found in 2024 or 2025. Make sure cookies are correct.',
                        requiresCookies: true
                    });
                }
                
                espnData = JSON.parse(responseText2024);
                console.log('Using 2024 season data');
            } else {
                espnData = JSON.parse(responseText);
                console.log('Using 2025 season data');
            }
            
            // Extract all teams and rosters with projections
            const teams = espnData.teams || [];
            const members = espnData.members || [];
            
            // Create a map of member IDs to names
            const memberMap = {};
            members.forEach(member => {
                memberMap[member.id] = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown';
            });
            
            console.log(`Found ${teams.length} teams in league`);
            
            // Process each team's roster with projections
            const teamsWithProjections = teams.map(team => {
                const primaryOwner = team.primaryOwner || team.owners?.[0];
                const ownerName = memberMap[primaryOwner] || 'Unknown Owner';
                
                // Parse roster with Week 1 projections
                const roster = (team.roster?.entries || []).map(entry => {
                    const player = entry.playerPoolEntry?.player;
                    
                    // Get Week 1 projection
                    const weekProjection = player?.stats?.find(stat => 
                        stat.scoringPeriodId === 1 && // Week 1
                        stat.statSourceId === 1 // 1 = projections
                    );
                    
                    const positionMap = {
                        0: 'QB', 1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'D/ST'
                    };
                    
                    // Lineup slot IDs: 0=QB, 2=RB, 4=WR, 6=TE, 23=FLEX, 17=K, 16=D/ST, 20=Bench
                    const slotMap = {
                        0: 'QB', 2: 'RB', 4: 'WR', 6: 'TE', 
                        23: 'FLEX', 17: 'K', 16: 'D/ST', 20: 'BENCH'
                    };
                    
                    return {
                        lineupSlotId: entry.lineupSlotId,
                        lineupSlot: slotMap[entry.lineupSlotId] || 'BENCH',
                        playerId: entry.playerId,
                        playerName: player?.fullName || 'Empty',
                        position: positionMap[player?.defaultPositionId] || 'FLEX',
                        team: player?.proTeamId || 0,
                        injuryStatus: player?.injuryStatus || 'ACTIVE',
                        projectedPoints: weekProjection?.appliedTotal || 0,
                        isStarter: entry.lineupSlotId !== 20 // Not on bench
                    };
                });
                
                return {
                    id: team.id,
                    name: team.name || `${team.location || ''} ${team.nickname || ''}`.trim() || `Team ${team.id}`,
                    owner: ownerName,
                    roster: roster,
                    points: team.points || 0,
                    projectedPoints: roster.filter(p => p.isStarter).reduce((sum, p) => sum + p.projectedPoints, 0),
                    record: {
                        wins: team.record?.overall?.wins || 0,
                        losses: team.record?.overall?.losses || 0
                    }
                };
            });
            
            // Log a sample team's projections
            if (teamsWithProjections.length > 0) {
                const sampleTeam = teamsWithProjections.find(t => t.id === 9) || teamsWithProjections[0];
                console.log(`Sample team (${sampleTeam.name}) projections:`, 
                    sampleTeam.roster.filter(p => p.isStarter).map(p => 
                        `${p.playerName} (${p.position}): ${p.projectedPoints.toFixed(1)} pts`
                    )
                );
            }
            
            // Extract roster position settings
            const rosterSettings = espnData.settings?.rosterSettings || {};
            const lineupSlotCounts = rosterSettings.lineupSlotCounts || {};
            
            res.json({
                success: true,
                leagueId: leagueId,
                season: espnData.seasonId || 2025,
                leagueName: espnData.settings?.name || 'ESPN League',
                teams: teamsWithProjections,
                currentWeek: espnData.scoringPeriodId || 1,
                settings: {
                    scoringType: espnData.settings?.scoringSettings?.scoringType,
                    maxTeams: espnData.settings?.size,
                    rosterPositions: {
                        QB: lineupSlotCounts['0'] || 1,
                        RB: lineupSlotCounts['2'] || 2,
                        WR: lineupSlotCounts['4'] || 2,
                        TE: lineupSlotCounts['6'] || 0,  // Your league has 0 TE
                        FLEX: lineupSlotCounts['23'] || 2,  // Your league has 2 FLEX
                        DST: lineupSlotCounts['16'] || 1,
                        K: lineupSlotCounts['17'] || 1,
                        BENCH: lineupSlotCounts['20'] || 6
                    },
                    playoffTeams: espnData.settings?.playoffTeamCount || 4,
                    regularSeasonLength: espnData.settings?.scheduleSettings?.matchupPeriodCount || 14,
                    tradeDeadline: espnData.settings?.tradeSettings?.deadlineDate || null,
                    waiverType: espnData.settings?.acquisitionSettings?.acquisitionType || 'WAIVER_PRIORITY',
                    waiverBudget: espnData.settings?.acquisitionSettings?.acquisitionBudget || 0
                }
            });
            
        } catch (error) {
            console.error('ESPN sync error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // ESPN matchups endpoint with full roster projections
    app.get('/api/fantasy/espn/matchups/:leagueId/:week', async (req, res) => {
        const { leagueId, week } = req.params;
        
        try {
            const fetch = require('node-fetch');
            
            // Try current year first, then fall back to 2024
            let data;
            let season = 2025;
            
            for (const year of [2025, 2024]) {
                const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${leagueId}?view=mMatchup&view=mMatchupScore&view=mTeam&view=mRoster&view=kona_player_info&scoringPeriodId=${week}`;
                
                console.log(`Trying to fetch matchups for season ${year}, week ${week}`);
                
                const response = await fetch(url);
                const responseText = await response.text();
                
                if (!responseText.includes('<!DOCTYPE') && !responseText.includes('<html')) {
                    data = JSON.parse(responseText);
                    season = year;
                    console.log(`Successfully fetched data for ${year} season`);
                    break;
                }
            }
            
            if (!data) {
                throw new Error('Could not fetch league data');
            }
            
            const schedule = data.schedule || [];
            const teams = data.teams || [];
            const members = data.members || [];
            
            // Create member map for owner names
            const memberMap = {};
            members.forEach(member => {
                memberMap[member.id] = `${member.firstName || ''} ${member.lastName || ''}`.trim();
            });
            
            // Create team map with full roster projections
            const teamMap = {};
            teams.forEach(team => {
                const primaryOwner = team.primaryOwner || team.owners?.[0];
                const ownerName = memberMap[primaryOwner] || 'Unknown';
                
                // Get each player's projection for the week
                const roster = (team.roster?.entries || []).map(entry => {
                    const player = entry.playerPoolEntry?.player;
                    
                    // Get projection for this specific week
                    const weekProjection = player?.stats?.find(stat => 
                        stat.scoringPeriodId == week && 
                        stat.statSourceId === 1  // 1 = projections, 0 = actual
                    );
                    
                    const positionMap = {
                        1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'D/ST'
                    };
                    
                    // Lineup slot IDs: 0=QB, 2=RB, 4=WR, 6=TE, 23=FLEX, 17=K, 16=D/ST, 20=Bench
                    const slotMap = {
                        0: 'QB', 2: 'RB', 4: 'WR', 6: 'TE', 
                        23: 'FLEX', 17: 'K', 16: 'D/ST', 20: 'BENCH'
                    };
                    
                    return {
                        lineupSlotId: entry.lineupSlotId,
                        lineupSlot: slotMap[entry.lineupSlotId] || 'BENCH',
                        playerId: entry.playerId,
                        playerName: player?.fullName || 'Empty',
                        position: positionMap[player?.defaultPositionId] || 'FLEX',
                        projectedPoints: weekProjection?.appliedTotal || 0,
                        actualPoints: 0, // Week 1 hasn't been played yet
                        isStarter: entry.lineupSlotId !== 20
                    };
                });
                
                // Calculate total projected points (starters only)
                const totalProjected = roster
                    .filter(p => p.isStarter)
                    .reduce((sum, p) => sum + p.projectedPoints, 0);
                
                teamMap[team.id] = {
                    id: team.id,
                    name: team.name || `${team.location || ''} ${team.nickname || ''}`.trim() || `Team ${team.id}`,
                    owner: ownerName,
                    record: {
                        wins: team.record?.overall?.wins || 0,
                        losses: team.record?.overall?.losses || 0
                    },
                    rank: team.playoffSeed || 0,
                    projectedPoints: totalProjected,
                    actualPoints: 0, // No actual points for Week 1 yet
                    roster: roster
                };
            });
            
            // Parse matchups for the specified week
            let weekMatchups = schedule.filter(game => game.matchupPeriodId == week);
            
            console.log(`Found ${weekMatchups.length} matchups for week ${week}`);
            
            // If no matchups found and it's 2025, try getting the schedule structure differently
            if (weekMatchups.length === 0 && season === 2025) {
                console.log('No 2025 matchups found, creating matchups from team pairs');
                // Create matchups by pairing teams
                for (let i = 0; i < teams.length; i += 2) {
                    if (teams[i + 1]) {
                        weekMatchups.push({
                            matchupPeriodId: week,
                            home: { teamId: teams[i].id },
                            away: { teamId: teams[i + 1].id }
                        });
                    }
                }
                console.log(`Created ${weekMatchups.length} provisional matchups`);
            }
            
            const matchups = weekMatchups.map(game => {
                const homeTeam = teamMap[game.home?.teamId];
                const awayTeam = game.away?.teamId ? teamMap[game.away.teamId] : null;
                
                // Log each matchup for debugging
                if (homeTeam && awayTeam) {
                    console.log(`Matchup: ${homeTeam.name} (ID: ${homeTeam.id}) vs ${awayTeam.name} (ID: ${awayTeam.id})`);
                }
                
                return {
                    id: game.id,
                    homeTeamId: game.home?.teamId,
                    homeTeam: homeTeam,
                    homeScore: game.home?.totalPoints || 0,
                    homeProjectedScore: homeTeam?.projectedPoints || game.home?.totalPointsLive || 0,
                    awayTeamId: game.away?.teamId,
                    awayTeam: awayTeam,
                    awayScore: game.away?.totalPoints || 0,
                    awayProjectedScore: awayTeam?.projectedPoints || game.away?.totalPointsLive || 0,
                    week: week
                };
            }).filter(m => m.homeTeam && m.awayTeam); // Filter out any incomplete matchups
            
            // Log matchup summary
            console.log(`Week ${week} matchups (${matchups.length} total):`);
            matchups.forEach(m => {
                console.log(`  ${m.homeTeam.name} (${m.homeProjectedScore.toFixed(1)} proj) vs ${m.awayTeam.name} (${m.awayProjectedScore.toFixed(1)} proj)`);
            });
            
            res.json({
                success: true,
                week: parseInt(week),
                season: season,
                matchups: matchups
            });
            
        } catch (error) {
            console.error('Matchups fetch error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // ESPN free agents/waiver wire endpoint
app.get('/api/fantasy/espn/players/:leagueId', async (req, res) => {
    const { leagueId } = req.params;
    const { scoringPeriodId = 1 } = req.query;
    
    try {
        const fetch = require('node-fetch');
        
        // ESPN API URL for available players
        const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/segments/0/leagues/${leagueId}?scoringPeriodId=${scoringPeriodId}&view=kona_player_info&view=players_wl`;
        
        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
        };
        
        const response = await fetch(url, { headers });
        const data = await response.json();
        
        // Get all players and filter for free agents
        const players = data.players || [];
        
        // Filter for available players (not on a team)
        const availablePlayers = players
            .filter(p => p.status === 'FREEAGENT' || p.status === 'WAIVERS')
            .map(p => ({
                id: p.id,
                name: p.fullName,
                position: p.defaultPositionId,
                team: p.proTeamId,
                injured: p.injured || false,
                percentOwned: p.ownership?.percentOwned || 0,
                percentChange: p.ownership?.percentChange || 0,
                projectedPoints: p.stats?.[0]?.appliedTotal || 0
            }))
            .sort((a, b) => b.percentChange - a.percentChange)
            .slice(0, 50); // Top 50 trending
        
        res.json({
            success: true,
            players: availablePlayers,
            waiverDate: data.settings?.tradeSettings?.deadlineDate
        });
        
    } catch (error) {
        console.error('ESPN players fetch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ESPN league activity/transactions endpoint
app.get('/api/fantasy/espn/activity/:leagueId', async (req, res) => {
    const { leagueId } = req.params;
    
    try {
        const fetch = require('node-fetch');
        
        const url = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/segments/0/leagues/${leagueId}/communication/?view=kona_league_communication`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const recentActivity = (data.topics || [])
            .slice(0, 20) // Last 20 activities
            .map(activity => ({
                date: activity.date,
                type: activity.type,
                messages: activity.messages
            }));
        
        res.json({
            success: true,
            activities: recentActivity
        });
        
    } catch (error) {
        console.error('ESPN activity error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
};