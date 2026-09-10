import 'dotenv/config'

const integer = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: integer(process.env.PORT, 5000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/skillbridge',
  databasePoolSize: integer(process.env.DB_POOL_SIZE, 10),
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-this-secret-now',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenDays: integer(process.env.REFRESH_TOKEN_DAYS, 7),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((url) => url.trim()),
  trustProxy: integer(process.env.TRUST_PROXY, 0),
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'dev'),
  maxUploadMb: integer(process.env.MAX_UPLOAD_MB, 5),
})

if (!env.databaseUrl.startsWith('postgresql://') && !env.databaseUrl.startsWith('postgres://')) {
  throw new Error('DATABASE_URL must be a PostgreSQL connection string')
}

if (env.nodeEnv === 'production' && env.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters in production')
}
