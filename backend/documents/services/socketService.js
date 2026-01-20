// backend/documents/services/socketService.js
// WebSocket service for real-time document notifications

let io = null;
const familyRooms = new Map();

const socketService = {
  /**
   * Initialize the socket service with a Socket.IO instance
   * @param {Object} socketIO - Socket.IO server instance
   */
  initialize(socketIO) {
    io = socketIO;

    if (io) {
      io.on('connection', (socket) => {
        console.log('Document socket connected:', socket.id);

        // Join family room
        socket.on('join_family', (familyId) => {
          socket.join(`family_${familyId}`);

          if (!familyRooms.has(familyId)) {
            familyRooms.set(familyId, new Set());
          }
          familyRooms.get(familyId).add(socket.id);

          console.log(`Socket ${socket.id} joined family room ${familyId}`);
        });

        // Leave family room
        socket.on('leave_family', (familyId) => {
          socket.leave(`family_${familyId}`);

          if (familyRooms.has(familyId)) {
            familyRooms.get(familyId).delete(socket.id);
          }
        });

        // Disconnect handling
        socket.on('disconnect', () => {
          console.log('Document socket disconnected:', socket.id);

          // Clean up from all family rooms
          familyRooms.forEach((sockets, familyId) => {
            sockets.delete(socket.id);
          });
        });
      });
    }
  },

  /**
   * Emit an event to all members of a family
   * @param {string} familyId - The family ID to emit to
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToFamily(familyId, event, data) {
    if (io) {
      io.to(`family_${familyId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    } else {
      // Log the event if socket not initialized (useful for testing/dev)
      console.log(`[SocketService] Would emit to family ${familyId}:`, event, data);
    }
  },

  /**
   * Emit an event to a specific user
   * @param {string} userId - The user ID to emit to
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    if (io) {
      io.to(`user_${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Broadcast an event to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcast(event, data) {
    if (io) {
      io.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Get the number of connected clients in a family room
   * @param {string} familyId - The family ID
   * @returns {number} Number of connected clients
   */
  getFamilyConnectionCount(familyId) {
    return familyRooms.has(familyId) ? familyRooms.get(familyId).size : 0;
  },

  /**
   * Check if socket service is initialized
   * @returns {boolean} Whether the service is initialized
   */
  isInitialized() {
    return io !== null;
  }
};

module.exports = socketService;
