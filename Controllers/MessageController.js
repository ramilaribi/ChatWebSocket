import Message from '../models/MessageModel.js';

export const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const message = new Message({ senderId, receiverId, content });
    await message.save();

    res.status(201).json(message);
    console.log(message)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchChatHistory = async (req, res) => {
  const { userId, partnerId } = req.params;

  try {
    const chatHistory = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(chatHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
