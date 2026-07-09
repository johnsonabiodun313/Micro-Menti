// sockets/store.js

// In-memory cluster dictionary organizing live word frequencies
const activeRooms = {};

// Helper function to format data for the frontend UI
function formatCloudData(roomCode) {
  const room = activeRooms[roomCode];
  if (!room) return [];
  return Object.keys(room.wordCounts).map((word) => ({
    text: word,
    value: room.wordCounts[word],
  }));
}

module.exports = {
  activeRooms,
  formatCloudData,
};
