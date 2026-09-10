import mongoose from 'mongoose'

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
  industry: String,
  employeeCount: String,
  headquarters: String,
  website: String,
  about: String,
  logoUrl: String,
  verified: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

companySchema.index({ name: 'text', industry: 'text', headquarters: 'text' })
export const Company = mongoose.model('Company', companySchema)
