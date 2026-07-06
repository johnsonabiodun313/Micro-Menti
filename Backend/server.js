// server.js
require("dotenv").config(); // 👈 This must be line 1! It loads your .env variables into process.env

const express = require("express");
const http = require("http");

// 1. Initialize Express and the HTTP Server
const app = express();
const server = http.createServer(app);

// 2. Serve static files from the public folder
app.use(express.static("public"));

// 3. Simple health-check route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Backend infrastructure is active" });
});

// 4. Load Rodiat's socket logic
const socketSetup = require("./socketHandlers");
socketSetup(server);

// 5. Dynamic Port Binding (Now perfectly pulling from your .env file!)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server safely running on port ${PORT}`);
  console.log(`🔗 Local testing link: http://localhost:${PORT}/health`);
});
