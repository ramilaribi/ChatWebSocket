import { createServer } from 'http';
import app from './app.js';
import setupSocket from './socket.js';

const port = process.env.PORT ;

// Create HTTP Server
const httpServer = createServer(app);

// Setup Socket.IO
setupSocket(httpServer);
console.log('About to start the HTTP + WebSocket server...');

// Start Server
httpServer.listen(port, () => {
  console.log(`[SERVER] HTTP + WebSocket server running at http://localhost:${port}/`);
});
