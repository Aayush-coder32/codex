import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['success', 'opportunity', 'info', 'event', 'message', 'warning'], default: 'info' },
  title: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 1000 },
  link: String,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true })

notificationSchema.index({ recipient: 1, createdAt: -1 })
export const Notification = mongoose.model('Notification', notificationSchema)
