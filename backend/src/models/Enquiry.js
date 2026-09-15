import mongoose from 'mongoose'

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  interest: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
}, { timestamps: true })

enquirySchema.index({ createdAt: -1 })

export const Enquiry = mongoose.model('Enquiry', enquirySchema)
