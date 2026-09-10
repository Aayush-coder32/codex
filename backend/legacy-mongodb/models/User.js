import mongoose from 'mongoose'

const notificationSettingsSchema = new mongoose.Schema({
  opportunities: { type: Boolean, default: true },
  applications: { type: Boolean, default: true },
  messages: { type: Boolean, default: true },
  workshops: { type: Boolean, default: true },
  productUpdates: { type: Boolean, default: false },
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'faculty', 'company', 'admin'], required: true, index: true },
  avatarUrl: { type: String, default: null },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  isActive: { type: Boolean, default: true, index: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: Date,
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en-IN' },
    theme: { type: String, enum: ['system', 'light', 'high-contrast'], default: 'light' },
    notifications: { type: notificationSettingsSchema, default: () => ({}) },
  },
}, { timestamps: true })

userSchema.set('toJSON', { virtuals: true, transform: (_doc, value) => { delete value.passwordHash; delete value.__v; return value } })

export const User = mongoose.model('User', userSchema)
