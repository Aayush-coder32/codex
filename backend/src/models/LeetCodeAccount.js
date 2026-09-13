import mongoose from 'mongoose'

const leetCodeAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  username: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 30 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  sessionActive: { type: Boolean, default: false },
  lastLoginAt: Date,
}, { timestamps: true })

leetCodeAccountSchema.set('toJSON', { transform: (_doc, value) => {
  delete value.passwordHash
  delete value.__v
  delete value.sessionActive
  return value
} })

export const LeetCodeAccount = mongoose.model('LeetCodeAccount', leetCodeAccountSchema)
