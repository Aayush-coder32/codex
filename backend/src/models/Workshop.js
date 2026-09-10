// MongoDB model.
import mongoose from 'mongoose'

const workshopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  skill: { type: String, required: true, trim: true, index: true },
  instructor: { type: String, required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true, index: true },
  duration: String,
  capacity: { type: Number, min: 1, required: true },
  enrolledCount: { type: Number, min: 0, default: 0 },
  description: String,
  mode: { type: String, enum: ['Online', 'On-site', 'Hybrid'], default: 'Online' },
  meetingUrl: { type: String, select: false },
  status: { type: String, enum: ['Draft', 'Open', 'Closed', 'Completed', 'Cancelled'], default: 'Open' },
}, { timestamps: true })

workshopSchema.index({ status: 1, startDate: 1 })
export const Workshop = mongoose.model('Workshop', workshopSchema)
