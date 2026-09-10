import mongoose from 'mongoose'

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: false })

const applicationSchema = new mongoose.Schema({
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn'],
    default: 'Applied',
    index: true,
  },
  matchScore: { type: Number, min: 0, max: 100, default: 0 },
  coverLetter: { type: String, maxlength: 3000 },
  resumeSnapshot: { originalName: String, uploadedAt: Date },
  history: [historySchema],
}, { timestamps: true })

applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true })
applicationSchema.index({ student: 1, createdAt: -1 })
export const Application = mongoose.model('Application', applicationSchema)
