import mongoose from 'mongoose'

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['Internship', 'Job', 'Apprenticeship'], required: true, index: true },
  location: { type: String, required: true, trim: true, index: true },
  mode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], required: true, index: true },
  pay: String,
  duration: String,
  skills: [{ type: String, trim: true }],
  preferredSkills: [{ type: String, trim: true }],
  deadline: { type: Date, required: true, index: true },
  openings: { type: Number, min: 1, default: 1 },
  eligibility: String,
  experience: String,
  description: { type: String, required: true, maxlength: 5000 },
  responsibilities: [{ type: String, trim: true }],
  status: { type: String, enum: ['Draft', 'Active', 'Closed', 'Archived'], default: 'Draft', index: true },
  stats: {
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
  },
  publishedAt: Date,
}, { timestamps: true })

opportunitySchema.index({ title: 'text', skills: 'text', location: 'text' })
opportunitySchema.index({ status: 1, deadline: 1, createdAt: -1 })
export const Opportunity = mongoose.model('Opportunity', opportunitySchema)
