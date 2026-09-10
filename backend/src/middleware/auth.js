import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication is required', 'AUTH_REQUIRED')

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret, { issuer: 'skillbridge-api', audience: 'skillbridge-client' })
  } catch {
    throw new ApiError(401, 'The access token is invalid or expired', 'INVALID_ACCESS_TOKEN')
  }

  const user = await User.findById(payload.sub)
  if (!user || !user.isActive) throw new ApiError(401, 'This account is unavailable', 'ACCOUNT_UNAVAILABLE')
  req.user = user
  next()
})

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action', 'FORBIDDEN'))
  }
  next()
}
