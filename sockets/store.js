// sockets/store.js

// An in-memory Map/dictionary to keep track of word counts and room states
const activeRooms = {};

/**
 * Ensures a room exists in the memory store and updates its last active timestamp.
 */
export const joinRoom = (roomCode) => {
  if (!activeRooms[roomCode]) {
    activeRooms[roomCode] = { 
      isChanged: false, 
      wordCounts: {}, 
      lastUpdated: Date.now() 
    };
  } else {
    activeRooms[roomCode].lastUpdated = Date.now();
  }
};

/**
 * Add a word to a specific room's dictionary.
 */
export const addWord = (roomCode, word) => {
  if (!activeRooms[roomCode]) {
    joinRoom(roomCode);
  }
  
  const cleanWord = word.trim();
  if (!cleanWord) return;

  const room = activeRooms[roomCode];
  room.wordCounts[cleanWord] = (room.wordCounts[cleanWord] || 0) + 1;
  room.isChanged = true;
  room.lastUpdated = Date.now();
};

/**
 * Get all active rooms (for the broadcast loop).
 */
export const getRooms = () => activeRooms;

/**
 * Formats the word counts into an array for the clients.
 */
export const formatCloudData = (roomCode) => {
  const room = activeRooms[roomCode];
  if (!room) return [];
  
  return Object.entries(room.wordCounts).map(([text, value]) => ({ text, value }));
};

/**
 * Mark a room as synced after broadcasting.
 */
export const resetRoomChanged = (roomCode) => {
  if (activeRooms[roomCode]) {
    activeRooms[roomCode].isChanged = false;
  }
};

/**
 * RAM Protection: Cleanup rooms that have been idle for a specified time.
 */
export const cleanupIdleRooms = () => {
  const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour
  const now = Date.now();
  
  for (const roomCode in activeRooms) {
    if (now - activeRooms[roomCode].lastUpdated > IDLE_TIMEOUT) {
      delete activeRooms[roomCode];
      console.log(`[Store] Garbage collected idle room: ${roomCode}`);
    }
  }
};