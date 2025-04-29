import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs
  },
  { timestamps: true }
);

export default mongoose.model('Group', groupSchema);
