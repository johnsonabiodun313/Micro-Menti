// sockets/engine.js
import { joinRoom, addWord, getRooms, formatCloudData, resetRoomChanged } from './store.js';

/**
 * Starts the throttled broadcast loop running exactly every 500ms.
 * Iterates through active rooms and broadcasts only if state changed.
 */
export const startBroadcastLoop = (io) => {
  setInterval(() => {
    const rooms = getRooms();
    
    for (const roomCode in rooms) {
      if (rooms[roomCode].isChanged) {
        const payload = formatCloudData(roomCode);
        // Emit payload to all clients in the room
        io.to(roomCode).emit('cloudUpdate', payload);
        // Reset state so we don't broadcast again until new words are added
        resetRoomChanged(roomCode);
      }
    }
  }, 500); // 500ms throttle
};

export const registerEventHandlers = (io, socket) => {
  
  // 1. Handle a user joining a specific polling room
  socket.on('joinRoom', (roomCode) => {
    if (!roomCode) return;
    
    console.log(`[Engine] Socket ${socket.id} joining room: ${roomCode}`);
    socket.join(roomCode);
    
    // Ensure room is tracked in memory
    joinRoom(roomCode);
    
    // Immediately emit current state directly to the joining socket (Initial Handshake)
    socket.emit('cloudUpdate', formatCloudData(roomCode));
  });

  // 2. Handle adding a word to the poll
  socket.on('addWord', (data) => {
    // Expected data shape: { roomCode: '1234', word: 'hello' }
    const { roomCode, word } = data;
    if (roomCode && word) {
      addWord(roomCode, word);
    }
  });

  // 3. Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[Engine] Client disconnected (${socket.id}). Reason: ${reason}`);
    // Socket.io natively removes the client from its rooms automatically.
  });
};