// MongoDB model.
import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, maxlength: 3000 },
  audience: {
    type: String,
    enum: ['everyone', 'students', 'faculty', 'companies', 'institutions'],
    default: 'everyone',
    index: true,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft', index: true },
  publishedAt: Date,
  expiresAt: Date,
}, { timestamps: true })

announcementSchema.index({ status: 1, publishedAt: -1 })
export const Announcement = mongoose.model('Announcement', announcementSchema)
