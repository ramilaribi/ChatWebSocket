import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, 
    delivered: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
  