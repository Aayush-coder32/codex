// MongoDB model.
import mongoose from 'mongoose'

const workshopEnrollmentSchema = new mongoose.Schema({
  workshop: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Enrolled', 'Attended', 'Completed', 'Cancelled'], default: 'Enrolled' },
  completedAt: Date,
}, { timestamps: true })

workshopEnrollmentSchema.index({ workshop: 1, student: 1 }, { unique: true })
export const WorkshopEnrollment = mongoose.model('WorkshopEnrollment', workshopEnrollmentSchema)
