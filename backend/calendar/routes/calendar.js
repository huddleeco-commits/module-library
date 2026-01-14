// backend/routes/calendar.js - Complete Calendar Routes with WebSocket
const express = require('express');
const router = express.Router();

// Try to load models and middleware (they may not exist yet)
let Event, Family, authMiddleware, syncService;
try {
    Event = require('../models/Event');
    Family = require('../models/Family');
    authMiddleware = require('../middleware/auth');
    syncService = require('../services/SyncService');
} catch (error) {
    console.log('Calendar routes: Some models not available, using simple mode');
}

// ========== SIMPLE TEST ROUTES (NO AUTH - FOR REACT TESTING) ==========
// In-memory storage for testing
let testEvents = [];
let eventIdCounter = 1;

// Direct function for other services to add/update events
router.addOrUpdateEventDirect = (event) => {
  const existingIndex = testEvents.findIndex(e => e.id === event.id);
  if (existingIndex >= 0) {
    testEvents[existingIndex] = event;
    console.log('📅 Updated event in storage:', event.title);
  } else {
    testEvents.push(event);
    console.log('📅 Added event to storage:', event.title);
  }
};

// Helper function to add/update event in storage
function addOrUpdateEvent(event) {
  const existingIndex = testEvents.findIndex(e => e.id === event.id);
  if (existingIndex >= 0) {
    testEvents[existingIndex] = event;
    console.log('📅 Updated existing event in storage:', event.title);
  } else {
    testEvents.push(event);
    console.log('📅 Added new event to storage:', event.title);
  }
}

// Helper to handle WebSocket calendar updates
function handleCalendarWebSocket(io, action, event, familyId) {
  if (!io) return;
  
  io.to(`family-${familyId}`).emit('calendar_update', {
    action,
    event,
    familyId,
    source: event.sourceTaskId ? 'tasks' : 'calendar',
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Broadcast: Calendar ${action} - ${event.title}`);
}

// GET /api/calendar/events/:familyId - Get events
router.get('/events/:familyId', (req, res) => {
    const familyEvents = testEvents.filter(e => e.familyId === req.params.familyId);
    console.log(`📅 Fetching ${familyEvents.length} events for family ${req.params.familyId}`);
    res.json({
        success: true,
        events: familyEvents
    });
});

// POST /api/calendar/events - Create event
router.post('/events', (req, res) => {
    const newEvent = {
        id: `event-${eventIdCounter++}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    testEvents.push(newEvent);
    
    console.log('✅ Event created:', newEvent.title);
    
    // 🔥 BROADCAST VIA WEBSOCKET
    const io = req.app.get('io');
    if (io) {
        io.to(`family-${req.body.familyId}`).emit('calendar_update', {
            action: 'created',
            event: newEvent,
            familyId: req.body.familyId,
            timestamp: new Date().toISOString()
        });
        console.log('📡 Broadcast: Event created to family room');
        
        // Also emit platform sync event
        io.to(`family-${req.body.familyId}`).emit('platform_sync', {
            source: 'calendar',
            target: 'all',
            action: 'event_created',
            data: newEvent,
            familyId: req.body.familyId
        });
    }
    
    res.json({
        success: true,
        event: newEvent
    });
});

// PUT /api/calendar/events/:eventId - Update event
router.put('/events/:eventId', (req, res) => {
    const index = testEvents.findIndex(e => e.id === req.params.eventId);
    
    if (index !== -1) {
        testEvents[index] = {
            ...testEvents[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        const updatedEvent = testEvents[index];
        console.log('✅ Event updated:', updatedEvent.title);
        
        // 🔥 BROADCAST VIA WEBSOCKET
        const io = req.app.get('io');
        if (io) {
            io.to(`family-${updatedEvent.familyId}`).emit('calendar_update', {
                action: 'updated',
                event: updatedEvent,
                familyId: updatedEvent.familyId,
                timestamp: new Date().toISOString()
            });
            console.log('📡 Broadcast: Event updated to family room');
            
            io.to(`family-${updatedEvent.familyId}`).emit('platform_sync', {
                source: 'calendar',
                target: 'all',
                action: 'event_updated',
                data: updatedEvent,
                familyId: updatedEvent.familyId
            });
        }
        
        res.json({
            success: true,
            event: updatedEvent
        });
    } else {
        res.status(404).json({ success: false, error: 'Event not found' });
    }
});

// DELETE /api/calendar/events/:eventId - Delete event
router.delete('/events/:eventId', (req, res) => {
    const index = testEvents.findIndex(e => e.id === req.params.eventId);
    
    if (index !== -1) {
        const deleted = testEvents.splice(index, 1)[0];
        console.log('🗑️ Event deleted:', deleted.title);
        
        // 🔥 BROADCAST VIA WEBSOCKET
        const io = req.app.get('io');
        if (io) {
            io.to(`family-${deleted.familyId}`).emit('calendar_update', {
                action: 'deleted',
                event: deleted,
                familyId: deleted.familyId,
                timestamp: new Date().toISOString()
            });
            console.log('📡 Broadcast: Event deleted to family room');
            
            io.to(`family-${deleted.familyId}`).emit('platform_sync', {
                source: 'calendar',
                target: 'all',
                action: 'event_deleted',
                data: { id: deleted.id },
                familyId: deleted.familyId
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Event deleted' 
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Event not found' 
        });
    }
});

// ========== AUTHENTICATED ROUTES (FOR PRODUCTION) ==========
// Only add these if models are available

if (Event && Family && authMiddleware) {
    
    // Middleware to verify family membership
    const verifyFamilyMember = async (req, res, next) => {
        try {
            const familyId = req.params.familyId || req.body.familyId;
            const family = await Family.findById(familyId);
            
            if (!family) {
                return res.status(404).json({ success: false, error: 'Family not found' });
            }
            
            if (!family.isMember(req.userId)) {
                return res.status(403).json({ success: false, error: 'Not a family member' });
            }
            
            req.family = family;
            req.memberPermissions = family.getMemberPermissions(req.userId);
            next();
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };

    // GET /api/calendar/family/:familyId/events - Get family events (authenticated)
    router.get('/family/:familyId/events', authMiddleware, verifyFamilyMember, async (req, res) => {
        try {
            const { startDate, endDate, view, member } = req.query;
            
            const query = {
                familyId: req.params.familyId,
                isDeleted: false
            };
            
            if (startDate && endDate) {
                query.startDate = { $lte: new Date(endDate) };
                query.$or = [
                    { endDate: { $gte: new Date(startDate) } },
                    { endDate: null, startDate: { $gte: new Date(startDate) } }
                ];
            }
            
            if (member) {
                query.assignedTo = member;
            }
            
            const visibilityQuery = {
                $or: [
                    { visibility: 'family' },
                    { visibility: 'private', createdBy: req.userId },
                    { visibility: 'assigned_only', $or: [
                        { assignedTo: req.userId },
                        { createdBy: req.userId }
                    ]}
                ]
            };
            
            const events = await Event.find({ ...query, ...visibilityQuery })
                .populate('createdBy', 'displayName avatar color')
                .populate('assignedTo', 'displayName avatar color')
                .sort('startDate');
            
            let groupedEvents = {};
            if (view === 'month' || view === 'week') {
                events.forEach(event => {
                    const dateKey = new Date(event.startDate).toISOString().split('T')[0];
                    if (!groupedEvents[dateKey]) {
                        groupedEvents[dateKey] = [];
                    }
                    groupedEvents[dateKey].push(event);
                });
            }
            
            res.json({
                success: true,
                events: view === 'month' || view === 'week' ? groupedEvents : events,
                count: events.length
            });
            
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // POST /api/calendar/family/:familyId/events - Create event (authenticated)
    router.post('/family/:familyId/events', authMiddleware, verifyFamilyMember, async (req, res) => {
        try {
            if (req.memberPermissions === 'viewer') {
                return res.status(403).json({ success: false, error: 'Insufficient permissions' });
            }
            
            const eventData = {
                ...req.body,
                familyId: req.params.familyId,
                createdBy: req.userId,
                source: {
                    platform: 'calendar',
                    platformEventId: req.body.id || null
                }
            };
            
            const event = new Event(eventData);
            await event.save();
            
            await event.populate('createdBy', 'displayName avatar color');
            await event.populate('assignedTo', 'displayName avatar color');
            
            if (syncService) {
                syncService.syncEventToPlatforms(event);
            }
            
            req.family.stats.totalEvents += 1;
            await req.family.save();
            
            res.json({
                success: true,
                event,
                message: 'Event created successfully'
            });
            
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // GET /api/calendar/upcoming - Get upcoming events
    router.get('/upcoming', authMiddleware, async (req, res) => {
        try {
            const { familyId, days = 7 } = req.query;
            
            const family = await Family.findById(familyId);
            if (!family.isMember(req.userId)) {
                return res.status(403).json({ success: false, error: 'Not a family member' });
            }
            
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + parseInt(days));
            
            const events = await Event.getForDateRange(
                familyId,
                startDate,
                endDate,
                req.userId
            );
            
            res.json({
                success: true,
                events,
                count: events.length
            });
            
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });
}

// WebSocket listener for cross-platform calendar events
router.initializeWebSocketListeners = (io) => {
  io.on('connection', (socket) => {
    // Listen for calendar updates from other platforms (like tasks)
    socket.on('calendar_update', (data) => {
      if (data.source === 'tasks') {
        // Add the event to storage
        addOrUpdateEvent(data.event);
        
        // Broadcast to all clients
        handleCalendarWebSocket(io, data.action, data.event, data.familyId);
      }
    });
  });
};

// Helper to get events sync (for other routes)
router.getEventSync = (eventId) => {
  return testEvents.find(e => e.id === eventId) || null;
};

module.exports = router;