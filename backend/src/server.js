import http from 'node:http'
import { app } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'

let server

async function start() {
  await connectDatabase()
  server = http.createServer(app)
  server.listen(env.port, () => console.info(`SkillBridge API listening on http://localhost:${env.port}`))
}

async function shutdown(signal) {
  console.info(`${signal} received, shutting down gracefully`)
  if (server) await new Promise((resolve) => server.close(resolve))
  await disconnectDatabase()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error)
  shutdown('unhandledRejection')
})

start().catch((error) => {
  console.error('Failed to start SkillBridge API:', error)
  process.exit(1)
})
