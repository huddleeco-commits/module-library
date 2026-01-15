// backend/routes/chat.js - Chat Routes with WebSocket
const express = require('express');
const router = express.Router();

// In-memory storage for testing
let messages = [];
let messageIdCounter = 1;

// GET /api/chat/messages/:familyId - Get all messages for family
router.get('/messages/:familyId', (req, res) => {
    const familyMessages = messages.filter(m => m.familyId === req.params.familyId);
    res.json({
        success: true,
        messages: familyMessages
    });
});

// POST /api/chat/messages - Send a message
router.post('/messages', (req, res) => {
    const newMessage = {
        id: `msg-${messageIdCounter++}`,
        familyId: req.body.familyId,
        userId: req.body.userId,
        userName: req.body.userName || 'Anonymous',
        userColor: req.body.userColor || '#00ffcc',
        text: req.body.text || '',
        type: req.body.type || 'text',
        createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    
    const io = req.app.get('io');
    
    // 🔥 BROADCAST MESSAGE VIA WEBSOCKET
    if (io) {
        io.to(`family-${req.body.familyId}`).emit('new_message', {
            message: newMessage,
            familyId: req.body.familyId,
            timestamp: new Date().toISOString()
        });

        // Also emit platform sync event
        io.to(`family-${req.body.familyId}`).emit('platform_sync', {
            source: 'chat',
            target: 'all',
            action: 'message_sent',
            data: newMessage,
            familyId: req.body.familyId
        });
    }
    
    res.json({
        success: true,
        message: newMessage
    });
});

// POST /api/chat/typing - Send typing indicator
router.post('/typing', (req, res) => {
    const { familyId, userId, userName, isTyping } = req.body;
    
    const io = req.app.get('io');
    
    if (io) {
        io.to(`family-${familyId}`).emit('user_typing', {
            userId,
            userName,
            isTyping,
            familyId,
            timestamp: new Date().toISOString()
        });
    }

    res.json({ success: true });
});

// DELETE /api/chat/messages/:messageId - Delete a message
router.delete('/messages/:messageId', (req, res) => {
    const index = messages.findIndex(m => m.id === req.params.messageId);
    
    if (index !== -1) {
        const deleted = messages.splice(index, 1)[0];

        const io = req.app.get('io');
        
        if (io) {
            io.to(`family-${deleted.familyId}`).emit('message_deleted', {
                messageId: deleted.id,
                familyId: deleted.familyId
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Message deleted' 
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Message not found' 
        });
    }
});

// POST /api/chat/messages/:messageId/react - Add reaction to message
router.post('/messages/:messageId/react', (req, res) => {
    const { emoji, userId } = req.body;
    const index = messages.findIndex(m => m.id === req.params.messageId);
    
    if (index !== -1) {
        if (!messages[index].reactions) {
            messages[index].reactions = {};
        }
        
        if (!messages[index].reactions[emoji]) {
            messages[index].reactions[emoji] = [];
        }
        
        if (!messages[index].reactions[emoji].includes(userId)) {
            messages[index].reactions[emoji].push(userId);
        }
        
        const io = req.app.get('io');
        
        if (io) {
            io.to(`family-${messages[index].familyId}`).emit('message_reaction', {
                messageId: messages[index].id,
                reactions: messages[index].reactions,
                familyId: messages[index].familyId
            });
        }
        
        res.json({
            success: true,
            message: messages[index]
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Message not found' 
        });
    }
});

module.exports = router;