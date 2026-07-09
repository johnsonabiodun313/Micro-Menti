// sockets/listeners.js
const Filter = require("bad-words");
const filter = new Filter();
const { activeRooms, formatCloudData } = require("./store");

// IMPORTANT: The 'socket' parameter is passed in here from index.js
module.exports = function registerListeners(socket) {
  socket.on("joinRoom", (roomCode) => {
    const normalizedCode = roomCode.toUpperCase();
    socket.join(normalizedCode);

    if (!activeRooms[normalizedCode]) {
      activeRooms[normalizedCode] = { wordCounts: {}, isChanged: false };
    }
    socket.emit("cloudUpdate", formatCloudData(normalizedCode));
  });

  socket.on("submitWord", ({ roomCode, word }) => {
    if (!roomCode || !word || typeof word !== "string") return;
    const normalizedCode = roomCode.toUpperCase(); // Added normalization
    if (!activeRooms[normalizedCode]) return;

    const cleanWord = filter.clean(word.trim().toLowerCase().substring(0, 25));
    if (cleanWord.length === 0) return;

    const room = activeRooms[normalizedCode];
    room.wordCounts[cleanWord] = (room.wordCounts[cleanWord] || 0) + 1;
    room.isChanged = true;
  });

  socket.on("resetCloud", (roomCode) => {
    const normalizedCode = roomCode.toUpperCase(); // Added normalization
    if (activeRooms[normalizedCode]) {
      activeRooms[normalizedCode].wordCounts = {};
      activeRooms[normalizedCode].isChanged = true;
    }
  });
};
