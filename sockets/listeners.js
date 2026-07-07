// sockets/listeners.js
const Filter = require("bad-words");
const filter = new Filter();
const { activeRooms, formatCloudData } = require("./store");

module.exports = function registerListeners(socket) {
  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);

    if (!activeRooms[roomCode]) {
      activeRooms[roomCode] = { wordCounts: {}, isChanged: false };
    }
    socket.emit("cloudUpdate", formatCloudData(roomCode));
  });

  socket.on("submitWord", ({ roomCode, word }) => {
    if (!roomCode || !word || typeof word !== "string") return;
    if (!activeRooms[roomCode]) return;

    const cleanWord = filter.clean(word.trim().toLowerCase().substring(0, 25));
    if (cleanWord.length === 0) return;

    const room = activeRooms[roomCode];
    room.wordCounts[cleanWord] = (room.wordCounts[cleanWord] || 0) + 1;
    room.isChanged = true;
  });

  socket.on("resetCloud", (roomCode) => {
    if (activeRooms[roomCode]) {
      activeRooms[roomCode].wordCounts = {};
      activeRooms[roomCode].isChanged = true;
    }
  });
};
