import mongoose from 'mongoose'
import { env } from './env.js'

mongoose.set('strictQuery', true)

export async function connectDatabase() {
  mongoose.connection.on('error', (error) => console.error('MongoDB error:', error.message))
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10_000 })
  console.info(`MongoDB connected: ${mongoose.connection.name}`)
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
