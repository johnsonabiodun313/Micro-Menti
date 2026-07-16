import Filter from 'bad-words';
import { getRooms, joinRoom } from './store.js';

const filter = new Filter();

export const registerListeners = (io, socket) => {
  socket.on('submitWord', (payload) => {
    if (!payload || typeof payload !== 'object') return;
    const { roomCode, word } = payload;
    
    if (!roomCode) return;
    
    // Payload Extraction & String Validation
    if (typeof word !== 'string') return;
    
    // Truncation & Normalization
    const cleanWord = word.trim().toLowerCase().substring(0, 25);
    
    // Empty & Profanity Scrubbing
    if (cleanWord.length === 0) return;
    if (filter.isProfane(cleanWord)) return;
    
    const activeRooms = getRooms();
    if (!activeRooms[roomCode]) {
      joinRoom(roomCode);
    }
    
    // Dictionary Update
    const room = activeRooms[roomCode];
    room.wordCounts[cleanWord] = (room.wordCounts[cleanWord] || 0) + 1;
    room.isChanged = true;
  });

  socket.on('resetCloud', (roomCode) => {
    if (typeof roomCode !== 'string') return;
    const normalizedCode = roomCode.trim();
    if (!normalizedCode) return;
    
    const activeRooms = getRooms();
    if (!activeRooms[normalizedCode]) {
      joinRoom(normalizedCode);
    }
    
    const room = activeRooms[normalizedCode];
    // Reset the in-memory dictionary to empty
    room.wordCounts = {};
    room.isChanged = false;
    
    // IMMEDIATELY broadcast an empty cloudUpdate payload directly to all connected clients
    io.to(normalizedCode).emit('cloudUpdate', []);
  });
};
