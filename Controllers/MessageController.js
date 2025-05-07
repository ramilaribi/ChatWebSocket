import Message from '../models/MessageModel.js';

// GET /messages/:userId/:partnerId
export const fetchChatHistory = async (req, res) => {
  const { userId, partnerId } = req.params;  // Use req.params for path parameters
  console.log(`Fetching chat history for userId: ${userId} and partnerId: ${partnerId}`);

  try {
    const chatHistory = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .select('senderId receiverId content timestamp delivered');
    console.log(`Fetched ${chatHistory.length} messages from the database`);

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
