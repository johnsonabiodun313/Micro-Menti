// server.js
const express = require('express');
const http = require('http');

// 1. Initialize Express and the HTTP Server
const app = express();
const server = http.createServer(app);

// 2. Serve static files from the public folder (useful for frontend testing later)
app.use(express.static('public'));

// 3. Simple health-check route to verify the server is alive
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend infrastructure is active' });
});

// 4. PLACEHOLDER: This is where we will load Rodiat's socket logic later
// const socketSetup = require('./socketHandlers');
// socketSetup(server);

// 5. Dynamic Port Binding
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`🚀 Server safely running on port ${PORT}`);
        console.log(`🔗 Local testing link: http://localhost:${PORT}/health`);
    });