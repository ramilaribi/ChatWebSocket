// // Import Core Packages
// import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { Server } from 'socket.io';

// // Import Internal Files
// import authRoute from './Routes/AuthRoutes.js';
// import db from './Config/DBConnection.js';
// import jwt from 'jsonwebtoken';
// import MessageModel from './models/MessageModel.js' ;// Assuming Message model is defined

// // Initialize environment variables
// dotenv.config(); 

// // Initialize Express app
// const app = express();
// const port = process.env.PORT;

// // Resolve __dirname manually (because of ESM)
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Enable middlewares
// app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Mount API routes
// app.use(authRoute);

// // Setup HTTP server manually (to share with Socket.IO)
// const httpServer = createServer(app);

// // Setup Socket.IO
// const io = new Server(httpServer, {
//   cors: {
//     origin: '*', // Adjust in production for security
//     methods: ['GET', 'POST'],
//   }
// });

// // In-memory user tracking
// const users = new Map(); // userId => socket.id
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;  // Retrieve token from the handshake
//   console.log('Received token: ', token);

//   if (!token) {
//     return next(new Error('Authentication error: Token missing'));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.userId = decoded._id;  // Attach user info to the socket
//     next();  // Allow connection
//   } catch (error) {
//     console.log(`Exception while doing something: ${error}`);
//   }
// });
// // Handle Socket.IO events
// io.on('connection', (socket) => {
//   console.log(`[SOCKET] User connected: ${socket.id}`);

//   // Register user after connection
//   socket.on('register_user', (userId) => {
//     users.set(userId, socket.id);
//     console.log(`[SOCKET] Registered user: ${userId} with socket: ${socket.id}`);
//   });

//   // User joins a group room
//   socket.on('join_room', (roomId) => {
//     socket.join(roomId);
//     console.log(`[SOCKET] Socket ${socket.id} joined room ${roomId}`);
//   });



//   socket.on('private_message', ({ toUserId, message }, callback) => {
//     const targetSocketId = users.get(toUserId);
  
//     const newMessage = new Message({
//       fromUserId: socket.userId,
//       toUserId,
//       message,
//       timestamp: Date.now(),
//     });
  
//     newMessage.save().then(() => {
//       if (targetSocketId) {
//         io.to(targetSocketId).emit('receive_private_message', newMessage);
//         callback({ success: true, message: 'Message sent' });
//       } else {
//         callback({ success: false, message: 'User not connected, saved in database' });
//       }
//     }).catch(err => {
//       callback({ success: false, message: 'Error saving message ' });
//     });
//   });


//   socket.on('reconnect', () => {
//     Message.find({ toUserId: socket.userId, read: false })
//       .then(messages => {
//         messages.forEach(msg => {
//           socket.emit('receive_private_message', msg);
//         });
//         // Optionally, mark messages as read
//         Message.updateMany({ toUserId: socket.userId, read: false }, { read: true })
//           .then(() => console.log("Marked messages as read"))
//           .catch(err => console.log("Error marking messages as read"));
//       })
//       .catch(err => console.log("Error fetching offline messages", err));
//   });
  
  
  
//   socket.on('typing', (toUserId) => {
//     const targetSocketId = users.get(toUserId);
//     if (targetSocketId) {
//       io.to(targetSocketId).emit('user_typing', { fromUserId: socket.id });
//     }
//   });
//   // Handle room-based group chat
//   socket.on('room_message', ({ roomId, message }) => {
//     io.to(roomId).emit('receive_room_message', {
//       fromSocketId: socket.id,
//       roomId,
//       message
//     });
//     console.log(`[SOCKET] Room message sent to room ${roomId}`);
//   });

//   // Optional: Broadcast message to everyone
//   socket.on('broadcast_message', (message) => {
//     io.emit('receive_broadcast', {
//       fromSocketId: socket.id,
//       message
//     });
//     console.log(`[SOCKET] Global broadcast: ${message}`);
//   });

//   // Handle user disconnect
//   socket.on('disconnect', () => {
//     console.log(`[SOCKET] User disconnected: ${socket.id}`);

//     for (const [userId, socketId] of users.entries()) {
//       if (socketId === socket.id) {
//         users.delete(userId);
//         console.log(`[SOCKET] Unregistered user: ${userId}`);
//         break;
//       }
//     }
//   });
// });

// // Database Connection
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('[DB] MongoDB connection is open');

//   // Start server
//   httpServer.listen(port, () => {
//     console.log(`[SERVER] HTTP + WebSocket server running at http://localhost:${port}/`);
//   });
// });
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/DBConnection.js';
import authRoute from './routes/AuthRoutes.js';
import message  from './Routes/Message_Routes.js';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(authRoute);
app.use(message);
// Database Connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('[DB] MongoDB connection is open');
});

export default app;
