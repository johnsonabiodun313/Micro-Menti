// sockets/index.js
import { registerEventHandlers, startBroadcastLoop } from './engine.js';
import { cleanupIdleRooms } from './store.js';

/**
 * Initializes the socket connection flow and broadcast loops.
 * @param {Server} io - The Socket.io Server instance from server.js
 */
export const initializeSockets = (io) => {
  console.log('🚀 Starting throttled broadcast loop (500ms)...');
  startBroadcastLoop(io);

  // RAM Protection: Clear idle rooms every 15 minutes to prevent memory leaks
  setInterval(() => {
    cleanupIdleRooms();
  }, 15 * 60 * 1000);

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected to Socket.io: ${socket.id}`);
    
    // Immediately emit a generic handshake or setup direct listeners
    // register all of your engine event listeners onto this socket
    registerEventHandlers(io, socket);
  });
};