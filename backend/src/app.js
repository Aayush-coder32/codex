import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env.js'
import { isDatabaseReady } from './config/database.js'
import apiRoutes from './routes/index.js'
import { errorHandler, notFound } from './middleware/error.js'
import { requestId } from './middleware/requestId.js'

export const app = express()

app.disable('x-powered-by')
if (env.trustProxy) app.set('trust proxy', env.trustProxy)
app.use(requestId)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }))
app.use(cors({
  credentials: true,
  origin(origin, done) {
    if (!origin || env.clientUrls.includes(origin)) return done(null, true)
    done(null, false)
  },
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))
if (env.logLevel !== 'silent') {
  morgan.token('request-id', (req) => req.id)
  app.use(morgan(`:method :url :status :response-time ms req=:request-id`, { skip: (_req, res) => env.logLevel === 'error' && res.statusCode < 400 }))
}

app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }))
app.get('/health/live', (_req, res) => res.json({ data: { status: 'ok', service: 'skillbridge-api' } }))
app.get('/health/ready', (_req, res) => {
  const ready = isDatabaseReady()
  res.status(ready ? 200 : 503).json({ data: { status: ready ? 'ready' : 'not-ready', database: ready ? 'connected' : 'disconnected' } })
})
app.use('/api/v1', apiRoutes)
app.use(notFound)
app.use(errorHandler)
