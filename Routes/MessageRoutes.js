import express from 'express';
import { sendMessage, fetchChatHistory } from '../Controllers/MessageController.js';

const router = express.Router();


// Messaging Routes
router.post('/messages', sendMessage);
router.get('/messages/:userId/:partnerId', fetchChatHistory);

export default router;
