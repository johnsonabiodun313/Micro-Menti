// sockets/index.js
const { Server } = require("socket.io");
const registerListeners = require("./listeners");
const startThrottler = require("./engine");

module.exports = function (server) {
  const io = new Server(server, { cors: { origin: "*" } });

  // 1. Start listening to individual user connections
  io.on("connection", (socket) => {
    registerListeners(socket);
  });

  // 2. Start the global 500ms broadcast engine
  startThrottler(io);
};
