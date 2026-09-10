// MongoDB model.
import mongoose from 'mongoose'

const savedOpportunitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
}, { timestamps: true })

savedOpportunitySchema.index({ user: 1, opportunity: 1 }, { unique: true })
export const SavedOpportunity = mongoose.model('SavedOpportunity', savedOpportunitySchema)
