import mongoose from 'mongoose'

const interviewPreparationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  company: { type: String, required: true, trim: true, maxlength: 160 },
  role: { type: String, required: true, trim: true, maxlength: 160 },
  introduction: { type: String, required: true, trim: true, maxlength: 2000 },
  photo: {
    path: { type: String, required: true, select: false },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
}, { timestamps: true })

export const InterviewPreparation = mongoose.model('InterviewPreparation', interviewPreparationSchema)
