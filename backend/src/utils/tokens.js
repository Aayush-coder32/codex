import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export function createAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'skillbridge-api',
    audience: 'skillbridge-client',
  })
}

export const createRefreshToken = () => crypto.randomBytes(48).toString('base64url')

export const refreshExpiry = () => new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000)

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/api/v1/auth',
  maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000,
})
