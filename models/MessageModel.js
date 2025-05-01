import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Null for group messages
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Null for private messages
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
