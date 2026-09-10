import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../src/config/database.js'

async function check() {
  await connectDatabase()
  const collections = await mongoose.connection.db.listCollections({}, { nameOnly: true }).toArray()
  console.info(`MongoDB database reachable: ${mongoose.connection.name}`)
  console.info(`Collections: ${collections.map(({ name }) => name).sort().join(', ') || 'none'}`)
  await disconnectDatabase()
}

check().catch((error) => {
  console.error('Database check failed:', error.message)
  process.exitCode = 1
}).finally(async () => {
  await disconnectDatabase().catch(() => {})
})
