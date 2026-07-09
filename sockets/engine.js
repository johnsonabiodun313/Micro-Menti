// sockets/engine.js
const { activeRooms, formatCloudData } = require("./store");

module.exports = function startThrottler(io) {
  setInterval(() => {
    Object.keys(activeRooms).forEach((roomCode) => {
      const room = activeRooms[roomCode];

      // Only broadcast if new words were actually submitted
      if (room.isChanged) {
        const payload = formatCloudData(roomCode);
        io.to(roomCode).emit("cloudUpdate", payload);
        room.isChanged = false; // Reset the flag
      }
    });
  }, 500);
};
