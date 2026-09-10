import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Company } from '../models/Company.js'
import { StudentProfile } from '../models/StudentProfile.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { ApiError } from '../utils/ApiError.js'
import { publicUser } from '../utils/serializers.js'
import { createAccessToken, createRefreshToken, hashToken, refreshCookieOptions, refreshExpiry } from '../utils/tokens.js'

const cookieName = 'skillbridge_refresh'

const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function issueSession(user, req, res) {
  const refreshToken = createRefreshToken()
  await RefreshToken.create({ user: user._id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiry(), createdByIp: req.ip })
  res.cookie(cookieName, refreshToken, refreshCookieOptions())
  return createAccessToken(user)
}

export async function register(req, res) {
  const { name, email, password, role, organizationName } = req.validated.body
  if (await User.exists({ email })) throw new ApiError(409, 'An account with this email already exists', 'EMAIL_IN_USE')

  let company = null
  if (role === 'company') {
    if (!organizationName) throw new ApiError(422, 'organizationName is required for company accounts', 'ORGANIZATION_REQUIRED')
    company = await Company.findOne({ name: organizationName })
    if (!company) {
      const slug = `${slugify(organizationName)}-${crypto.randomBytes(3).toString('hex')}`
      company = await Company.create({ name: organizationName, slug })
    }
  }

  const user = await User.create({
    name, email, role, company: company?._id || null,
    passwordHash: await bcrypt.hash(password, 12),
  })
  if (role === 'student') await StudentProfile.create({ user: user._id })

  const accessToken = await issueSession(user, req, res)
  res.status(201).json({ data: { user: publicUser(user), accessToken } })
}

export async function login(req, res) {
  const { email, password } = req.validated.body
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Email or password is incorrect', 'INVALID_CREDENTIALS')
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been disabled', 'ACCOUNT_DISABLED')

  user.lastLoginAt = new Date()
  await user.save()
  const accessToken = await issueSession(user, req, res)
  res.json({ data: { user: publicUser(user), accessToken } })
}

export async function refresh(req, res) {
  const rawToken = req.cookies[cookieName]
  if (!rawToken) throw new ApiError(401, 'Refresh token is missing', 'REFRESH_TOKEN_REQUIRED')

  const currentHash = hashToken(rawToken)
  const stored = await RefreshToken.findOne({ tokenHash: currentHash, revokedAt: null, expiresAt: { $gt: new Date() } }).populate('user')
  if (!stored?.user?.isActive) {
    res.clearCookie(cookieName, refreshCookieOptions())
    throw new ApiError(401, 'Refresh token is invalid or expired', 'INVALID_REFRESH_TOKEN')
  }

  const nextToken = createRefreshToken()
  const nextHash = hashToken(nextToken)
  stored.revokedAt = new Date()
  stored.replacedByHash = nextHash
  await Promise.all([
    stored.save(),
    RefreshToken.create({ user: stored.user._id, tokenHash: nextHash, expiresAt: refreshExpiry(), createdByIp: req.ip }),
  ])
  res.cookie(cookieName, nextToken, refreshCookieOptions())
  res.json({ data: { user: publicUser(stored.user), accessToken: createAccessToken(stored.user) } })
}

export async function logout(req, res) {
  const rawToken = req.cookies[cookieName]
  if (rawToken) await RefreshToken.updateOne({ tokenHash: hashToken(rawToken), revokedAt: null }, { revokedAt: new Date() })
  res.clearCookie(cookieName, refreshCookieOptions())
  res.status(204).end()
}

export async function me(req, res) {
  await req.user.populate(['company', 'institution'])
  res.json({ data: { user: publicUser(req.user) } })
}

export async function forgotPassword(req, res) {
  const user = await User.findOne({ email: req.validated.body.email }).select('+passwordResetTokenHash +passwordResetExpiresAt')
  let developmentResetToken
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    user.passwordResetTokenHash = hashToken(token)
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000)
    await user.save()
    if (process.env.NODE_ENV !== 'production') developmentResetToken = token
    // Connect an email provider here and send the raw token in a frontend reset URL.
  }
  res.json({ data: { message: 'If that email is registered, a reset link has been prepared.', ...(developmentResetToken ? { developmentResetToken } : {}) } })
}

export async function resetPassword(req, res) {
  const { token, password } = req.validated.body
  const user = await User.findOne({ passwordResetTokenHash: hashToken(token), passwordResetExpiresAt: { $gt: new Date() } })
    .select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt')
  if (!user) throw new ApiError(400, 'Reset token is invalid or expired', 'INVALID_RESET_TOKEN')

  user.passwordHash = await bcrypt.hash(password, 12)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpiresAt = undefined
  await user.save()
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() })
  res.json({ data: { message: 'Password reset successfully' } })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body
  const user = await User.findById(req.user._id).select('+passwordHash')
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD')
  }
  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() })
  res.clearCookie(cookieName, refreshCookieOptions())
  res.json({ data: { message: 'Password changed. Please sign in again.' } })
}
