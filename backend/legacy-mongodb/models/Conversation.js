import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  title: String,
  lastMessageAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true })

conversationSchema.index({ participants: 1, lastMessageAt: -1 })
export const Conversation = mongoose.model('Conversation', conversationSchema)
