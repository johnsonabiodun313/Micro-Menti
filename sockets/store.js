// sockets/store.js
import { initDB, saveState } from './db.js';

// An in-memory Map/dictionary to keep track of word counts and room states
const activeRooms = {};
initDB(activeRooms);

export const flushToDB = () => saveState(activeRooms);

/**
 * Authoritative room creation by Presenter.
 */
export const createRoom = (roomCodeInput, topicInput = '') => {
  const code = String(roomCodeInput || '').trim().toUpperCase();
  if (!code) return null;
  
  if (!activeRooms[code]) {
    activeRooms[code] = {
      isChanged: false,
      wordCounts: {},
      lastUpdated: Date.now(),
      topic: topicInput.trim() || 'Live Word Cloud',
      isActive: true,
      createdAt: Date.now()
    };
  } else {
    if (topicInput.trim()) {
      activeRooms[code].topic = topicInput.trim();
    }
    activeRooms[code].isActive = true;
    activeRooms[code].lastUpdated = Date.now();
  }
  return activeRooms[code];
};

/**
 * Ensures a room exists or validates if it is active.
 */
export const joinRoom = (roomCode, allowAutoCreate = false) => {
  const code = String(roomCode || '').trim().toUpperCase();
  if (!code || !activeRooms[code] || !activeRooms[code].isActive) {
    if (allowAutoCreate && code) {
      return createRoom(code);
    }
    return null; // Room does not exist / inactive
  }
  activeRooms[code].lastUpdated = Date.now();
  return activeRooms[code];
};

/**
 * Add a word to a specific room's dictionary.
 */
export const addWord = (roomCode, word) => {
  const code = String(roomCode).trim().toUpperCase();
  const room = activeRooms[code];
  if (!room || !room.isActive) {
    return false; // Cannot add word to non-existent or inactive room
  }
  
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return false;

  room.wordCounts[cleanWord] = (room.wordCounts[cleanWord] || 0) + 1;
  room.isChanged = true;
  room.lastUpdated = Date.now();
  return true;
};

/**
 * Get all active rooms (for the broadcast loop).
 */
export const getRooms = () => activeRooms;

/**
 * Formats the word counts into an array for the clients.
 */
export const formatCloudData = (roomCode) => {
  const code = String(roomCode).trim().toUpperCase();
  const room = activeRooms[code];
  if (!room) return [];
  
  return Object.entries(room.wordCounts)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Mark a room as synced after broadcasting.
 */
export const resetRoomChanged = (roomCode) => {
  const code = String(roomCode).trim().toUpperCase();
  if (activeRooms[code]) {
    activeRooms[code].isChanged = false;
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