import MessageModel from '../models/MessageModel.js';

class MessageService {
  static async saveMessage({ content, senderId, receiverId, timestamp }) {
    const newMessage = new MessageModel({ content, senderId, receiverId, timestamp });
    return newMessage.save();
  }

  static async getUnreadMessages(toUserId) {
    return MessageModel.find({ toUserId, read: false });
  }

  static async markMessagesAsRead(toUserId) {
    return MessageModel.updateMany({ toUserId, read: false }, { read: true });
  }
}

export default MessageService;
