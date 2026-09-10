import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: Number, min: 0, max: 100, default: 50 },
}, { _id: false })

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  technologies: [{ type: String, trim: true }],
  github: String,
  live: String,
}, { timestamps: true })

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  organization: String,
  issueDate: Date,
  credential: String,
}, { timestamps: true })

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  phone: String,
  location: String,
  degree: String,
  college: String,
  branch: String,
  graduationYear: Number,
  cgpa: { type: Number, min: 0, max: 10 },
  about: { type: String, maxlength: 1200 },
  skills: [skillSchema],
  projects: [projectSchema],
  certificates: [certificateSchema],
  resume: {
    path: { type: String, select: false },
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date,
  },
  preferences: {
    targetRole: String,
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Flexible'], default: 'Flexible' },
    locations: [String],
    opportunityTypes: [{ type: String, enum: ['Internship', 'Job', 'Apprenticeship'] }],
  },
  readiness: { type: Number, min: 0, max: 100, default: 0 },
}, { timestamps: true })

studentProfileSchema.index({ 'skills.name': 1, graduationYear: 1 })
studentProfileSchema.index({ college: 'text', branch: 'text', location: 'text' })
export const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema)
