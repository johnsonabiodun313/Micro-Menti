// sockets/engine.js
import { joinRoom, createRoom, addWord, getRooms, formatCloudData, resetRoomChanged, flushToDB } from './store.js';

/**
 * Starts the throttled broadcast loop running exactly every 500ms.
 * Iterates through active rooms and broadcasts only if state changed.
 */
export const startBroadcastLoop = (io) => {
  setInterval(() => {
    const rooms = getRooms();
    let anyChanges = false;
    
    for (const roomCode in rooms) {
      if (rooms[roomCode].isChanged) {
        anyChanges = true;
        const payload = formatCloudData(roomCode);
        // Emit payload to all clients in the room
        io.to(roomCode).emit('cloudUpdate', payload);
        // Reset state so we don't broadcast again until new words are added
        resetRoomChanged(roomCode);
      }
    }

    if (anyChanges) {
      flushToDB(); // Periodically dump state to disk if anything changed
    }
  }, 500); // 500ms throttle
};

export const registerEventHandlers = (io, socket) => {
  
  // 1. Handle Presenter creating / activating a room
  socket.on('createRoom', (payload) => {
    let pin = '';
    let topic = '';
    if (typeof payload === 'string') {
      pin = payload;
    } else if (payload && typeof payload === 'object') {
      pin = String(payload.pin || payload.roomCode || payload.room || '').trim().toUpperCase();
      topic = payload.topic || payload.question || '';
    }
    if (!pin) return;
    const room = createRoom(pin, topic);
    if (room) {
      socket.join(pin);
      console.log(`[Engine] Presenter ${socket.id} created/activated room ${pin} with topic: "${room.topic}"`);
      socket.emit('roomCreated', { pin, topic: room.topic });
      socket.emit('cloudUpdate', formatCloudData(pin));
    }
  });

  // 2. Handle a user joining a specific polling room
  socket.on('joinRoom', (roomCodeInput) => {
    if (!roomCodeInput) return;
    const code = String(roomCodeInput).trim().toUpperCase();
    console.log(`[Engine] Socket ${socket.id} attempting to join room: ${code}`);
    
    // Ensure room exists and is active
    const room = joinRoom(code, false);
    if (!room) {
      console.warn(`[Engine] Socket ${socket.id} rejected. Room not found or inactive: ${code}`);
      socket.emit('roomError', { message: `Room "${code}" is not active or has not been created by a presenter yet.` });
      return;
    }

    socket.join(code);
    console.log(`[Engine] Socket ${socket.id} successfully joined room: ${code}`);
    
    // Immediately emit room metadata (topic) and current state directly to joining socket
    socket.emit('roomJoined', { pin: code, topic: room.topic });
    socket.emit('cloudUpdate', formatCloudData(code));
  });

  // 3. Handle adding a word to the poll
  socket.on('addWord', (data) => {
    let code = '';
    let wordStr = '';
    if (typeof data === 'string') {
      wordStr = data;
    } else if (data && typeof data === 'object') {
      code = String(data.roomCode || data.pin || '').trim().toUpperCase();
      wordStr = data.word || data.text || '';
    }
    if (code && wordStr) {
      addWord(code, wordStr);
    }
  });

  // 4. Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[Engine] Client disconnected (${socket.id}). Reason: ${reason}`);
    // Socket.io natively removes the client from its rooms automatically.
  });
};