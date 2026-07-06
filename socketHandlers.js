const { Server } = require("socket.io");
const Filter = require("bad-words");
const filter = new Filter();

module.exports = function (server) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  let wordCounts = {};

  // The Throttling Loop: Runs independently of user connections
  setInterval(() => {
    const payload = formatCloudData(wordCounts);
    if (payload.length > 0) {
      io.emit("cloudUpdate", payload);
    }
  }, 500);

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Send existing data to catching-up screens immediately
    socket.emit("cloudUpdate", formatCloudData(wordCounts));

    // Listen for user submissions
    socket.on("submitWord", (word) => {
      if (!word || typeof word !== "string") return;

      const cleanWord = word.trim().toLowerCase().substring(0, 25);
      if (cleanWord.length === 0) return;

      const safeWord = filter.clean(cleanWord);

      wordCounts[safeWord] = (wordCounts[safeWord] || 0) + 1;
    });

    // Listen for administrative clean resets
    socket.on("resetCloud", () => {
      console.log(`Administrative Reset triggered by: ${socket.id}`);
      wordCounts = {};
      io.emit("cloudUpdate", []);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

function formatCloudData(wordCountsObject) {
  return Object.keys(wordCountsObject).map((word) => {
    return {
      text: word,
      value: wordCountsObject[word],
    };
  });
}
