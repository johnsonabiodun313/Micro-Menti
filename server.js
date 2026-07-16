// server.js
require("dotenv").config(); // Loads environment variables from your .env file

const express = require("express");
const http = require("http");

// 1. Initialize Express App and HTTP Server
const app = express();
const server = http.createServer(app);

// 2. Serve static frontend assets from your public folder
app.use(express.static("public"));

// 3. Global Middleware to parse JSON bodies sent by the frontend
app.use(express.json());

// 4. REST API Route Mapping (Femi's Modular Routes)
const presentationRoutes = require("./routes/presentation");
app.use("/api/presentations", presentationRoutes);

// 5. System Health Check Route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Backend infrastructure is active" });
  console.log("Uptime monitor active...................");
});

// 6. Real-Time WebSockets Engine Setup (Rodiat's 500ms Throttler Wrapper)
const socketSetup = require("./sockets/index");
socketSetup(server);

// 7. Dynamic Server Port Binding
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Master Server safely running on port ${PORT}`);
  console.log(`🔗 Local testing link: http://localhost:${PORT}/health`);
});
