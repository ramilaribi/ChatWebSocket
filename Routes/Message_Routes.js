import express from 'express';
import { fetchChatHistory } from '../Controllers/MessageController.js';

const router = express.Router();

// Messaging Routes
router.get('/messages/:userId/:partnerId', fetchChatHistory);  // This will now match the path parameters

export default router;
