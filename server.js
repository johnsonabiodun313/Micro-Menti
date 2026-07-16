// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { initializeSockets } from './sockets/index.js'; // Import Milestone 4!
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'HTTP Server is running' });
  console.log("Uptime monitor active...................");
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// --- CONNECT THE SOCKETS ENTRY POINT ---
// This replaces the old temporary inline connection listener!
initializeSockets(io);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});