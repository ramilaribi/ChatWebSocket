import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import MessageService from './services/MessageService.js';
import Message from './models/MessageModel.js';

const users = new Map(); 
export default function setupSocket(httpServer) {
    const io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust in production for security
      methods: ['GET', 'POST'],
    },
    });
  // Middleware for Socket.IO Authentication
    io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    console.log('Received token: ', token);
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded._id;
      next();
    } catch (err) {
      console.log(`Exception while doing something: ${err}`);
    }
    });
    // Handle socket connection
    io.on('connection', (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);
    // Register User
    socket.on('register_user', (userId) => {
      users.set(userId, socket.id);
      console.log(`[SOCKET] Registered user: ${userId} with socket: ${socket.id}`);
    });
    socket.on('private_message', async ({ senderId, receiverId, content, timestamp }, callback) => {
        const targetSocketId = users.get(receiverId);
        try {
          const newMessage = await MessageService.saveMessage({
            content,         
            senderId,          
            receiverId,        
            timestamp,        
          });
      console.log(newMessage);
          if (targetSocketId) {
            io.to(targetSocketId).emit('receive_private_message', newMessage);
            callback({ success: true, message: 'Message sent' });
          } else {
            callback({ success: false, message: 'User not connected, saved in database' });
          }
        } catch (err) {
          console.log(`Error: ${err}`);
        }
    });
  // User joins a group room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`[SOCKET] Socket ${socket.id} joined room ${roomId}`);
     });
    // Typing Indicator
    socket.on('typing', (toUserId) => {
      const targetSocketId = users.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('user_typing', { fromUserId: socket.id });
      }
     });
    socket.on('reconnect', () => {
        Message.find({ toUserId: socket.userId, read: false })
          .then(messages => {
            messages.forEach(msg => {
              socket.emit('receive_private_message', msg);
            });
            // Optionally, mark messages as read
            Message.updateMany({ toUserId: socket.userId, read: false }, { read: true })
              .then(() => console.log("Marked messages as read"))
              .catch(err => console.log("Error marking messages as read"));
          })
          .catch(err => console.log("Error fetching offline messages", err));
     });
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User disconnected: ${socket.id}`);
      for (const [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          console.log(`[SOCKET] Unregistered user: ${userId}`);
          break;
        }
      }
    });
  });
}
