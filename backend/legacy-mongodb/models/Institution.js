import mongoose from 'mongoose'

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, unique: true, trim: true },
  type: { type: String, enum: ['University', 'Institute', 'College'], default: 'Institute' },
  city: String,
  state: String,
  website: String,
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

institutionSchema.index({ name: 'text', city: 'text', state: 'text' })
export const Institution = mongoose.model('Institution', institutionSchema)
