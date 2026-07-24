import Filter from 'bad-words';
import { getRooms, joinRoom, addWord, createRoom } from './store.js';

const filter = new Filter();

export const registerListeners = (io, socket) => {
  socket.on('submitWord', (payload) => {
    let roomCode = '';
    let wordStr = '';

    if (typeof payload === 'string') {
      wordStr = payload;
    } else if (payload && typeof payload === 'object') {
      roomCode = String(payload.roomCode || payload.pin || '').trim().toUpperCase();
      wordStr = payload.word || payload.text || '';
    }

    if (!roomCode || typeof wordStr !== 'string') return;

    // Check if room exists and is active before accepting word
    const activeRooms = getRooms();
    const room = activeRooms[roomCode];
    if (!room || !room.isActive) {
      socket.emit('roomError', { message: `Room "${roomCode}" is not active or has ended. Please check the PIN with your presenter.` });
      return;
    }

    // Truncation & Normalization
    const cleanWord = wordStr.trim().toLowerCase().substring(0, 25);
    if (cleanWord.length === 0) return;

    // Empty & Profanity Scrubbing
    try {
      if (filter.isProfane(cleanWord)) return;
    } catch (e) {
      // safe fallback if bad-words encounters special chars
    }

    // Ensure room is tracked and increment dictionary count
    addWord(roomCode, cleanWord);
  });

  socket.on('resetCloud', (roomCodeInput) => {
    let code = '';
    if (typeof roomCodeInput === 'string' && roomCodeInput.trim()) {
      code = roomCodeInput.trim().toUpperCase();
    } else if (roomCodeInput && typeof roomCodeInput === 'object') {
      code = String(roomCodeInput.roomCode || roomCodeInput.pin || '').trim().toUpperCase();
    }

    if (!code) return;
    const activeRooms = getRooms();
    if (!activeRooms[code]) return;

    const room = activeRooms[code];
    if (room) {
      room.wordCounts = {};
      room.isChanged = false;
    }

    // IMMEDIATELY broadcast an empty cloudUpdate payload directly to all connected clients
    io.to(code).emit('cloudUpdate', []);
  });
};
