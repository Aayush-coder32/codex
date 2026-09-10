import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { query, transaction } from '../../config/database.js'
import { findUserByEmail, findUserById, mapCompany, mapUser, newId } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { publicUser } from '../../utils/serializers.js'
import { createAccessToken, createRefreshToken, hashToken, refreshCookieOptions, refreshExpiry } from '../../utils/tokens.js'

const cookieName = 'skillbridge_refresh'
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function storeSession(executor, user, req) {
  const refreshToken = createRefreshToken()
  await executor(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_by_ip)
     VALUES ($1, $2, $3, $4, $5)`,
    [newId(), user.id, hashToken(refreshToken), refreshExpiry(), req.ip],
  )
  return refreshToken
}

export async function register(req, res) {
  const { name, email, password, role, organizationName } = req.validated.body
  if (await findUserByEmail(email)) throw new ApiError(409, 'An account with this email already exists', 'EMAIL_IN_USE')

  const result = await transaction(async (client) => {
    const execute = (text, values) => client.query(text, values)
    let company = null
    if (role === 'company') {
      if (!organizationName) throw new ApiError(422, 'organizationName is required for company accounts', 'ORGANIZATION_REQUIRED')
      company = mapCompany((await execute('SELECT * FROM companies WHERE LOWER(name) = LOWER($1)', [organizationName])).rows[0])
      if (!company) {
        const companyResult = await execute(
          'INSERT INTO companies (id, name, slug) VALUES ($1, $2, $3) RETURNING *',
          [newId(), organizationName, `${slugify(organizationName)}-${crypto.randomBytes(3).toString('hex')}`],
        )
        company = mapCompany(companyResult.rows[0])
      }
    }

    const userResult = await execute(
      `INSERT INTO users (id, name, email, password_hash, role, company_id)
       VALUES ($1, $2, LOWER($3), $4, $5, $6) RETURNING *`,
      [newId(), name, email, await bcrypt.hash(password, 12), role, company?.id || null],
    )
    const user = mapUser(userResult.rows[0])
    if (role === 'student') await execute('INSERT INTO student_profiles (id, user_id) VALUES ($1, $2)', [newId(), user.id])
    const refreshToken = await storeSession(execute, user, req)
    return { user, refreshToken }
  })

  res.cookie(cookieName, result.refreshToken, refreshCookieOptions())
  res.status(201).json({ data: { user: publicUser(result.user), accessToken: createAccessToken(result.user) } })
}

export async function login(req, res) {
  const { email, password } = req.validated.body
  const user = await findUserByEmail(email, { includeSecrets: true })
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Email or password is incorrect', 'INVALID_CREDENTIALS')
  }
  if (!user.isActive) throw new ApiError(403, 'This account has been disabled', 'ACCOUNT_DISABLED')

  const updated = mapUser((await query('UPDATE users SET last_login_at = NOW() WHERE id = $1 RETURNING *', [user.id])).rows[0])
  const refreshToken = await storeSession(query, updated, req)
  res.cookie(cookieName, refreshToken, refreshCookieOptions())
  res.json({ data: { user: publicUser(updated), accessToken: createAccessToken(updated) } })
}

export async function refresh(req, res) {
  const rawToken = req.cookies[cookieName]
  if (!rawToken) throw new ApiError(401, 'Refresh token is missing', 'REFRESH_TOKEN_REQUIRED')

  const currentHash = hashToken(rawToken)
  const stored = (await query(
    'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
    [currentHash],
  )).rows[0]
  const user = stored ? await findUserById(stored.user_id) : null
  if (!user?.isActive) {
    res.clearCookie(cookieName, refreshCookieOptions())
    throw new ApiError(401, 'Refresh token is invalid or expired', 'INVALID_REFRESH_TOKEN')
  }

  const nextToken = createRefreshToken()
  const nextHash = hashToken(nextToken)
  await transaction(async (client) => {
    await client.query('UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_hash = $2 WHERE id = $1', [stored.id, nextHash])
    await client.query(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_by_ip) VALUES ($1, $2, $3, $4, $5)',
      [newId(), user.id, nextHash, refreshExpiry(), req.ip],
    )
  })
  res.cookie(cookieName, nextToken, refreshCookieOptions())
  res.json({ data: { user: publicUser(user), accessToken: createAccessToken(user) } })
}

export async function logout(req, res) {
  const rawToken = req.cookies[cookieName]
  if (rawToken) await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [hashToken(rawToken)])
  res.clearCookie(cookieName, refreshCookieOptions())
  res.status(204).end()
}

export async function me(req, res) {
  const user = await findUserById(req.user.id, { includeRelations: true })
  res.json({ data: { user: publicUser(user) } })
}

export async function forgotPassword(req, res) {
  const user = await findUserByEmail(req.validated.body.email)
  let developmentResetToken
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    await query(
      `UPDATE users SET password_reset_token_hash = $2, password_reset_expires_at = NOW() + INTERVAL '30 minutes'
       WHERE id = $1`,
      [user.id, hashToken(token)],
    )
    if (process.env.NODE_ENV !== 'production') developmentResetToken = token
  }
  res.json({ data: { message: 'If that email is registered, a reset link has been prepared.', ...(developmentResetToken ? { developmentResetToken } : {}) } })
}

export async function resetPassword(req, res) {
  const { token, password } = req.validated.body
  const row = (await query(
    'SELECT * FROM users WHERE password_reset_token_hash = $1 AND password_reset_expires_at > NOW()',
    [hashToken(token)],
  )).rows[0]
  if (!row) throw new ApiError(400, 'Reset token is invalid or expired', 'INVALID_RESET_TOKEN')

  await transaction(async (client) => {
    await client.query(
      'UPDATE users SET password_hash = $2, password_reset_token_hash = NULL, password_reset_expires_at = NULL WHERE id = $1',
      [row.id, await bcrypt.hash(password, 12)],
    )
    await client.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [row.id])
  })
  res.json({ data: { message: 'Password reset successfully' } })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body
  const user = await findUserById(req.user.id, { includeSecrets: true })
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'Current password is incorrect', 'INVALID_CURRENT_PASSWORD')
  }
  await transaction(async (client) => {
    await client.query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, await bcrypt.hash(newPassword, 12)])
    await client.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [user.id])
  })
  res.clearCookie(cookieName, refreshCookieOptions())
  res.json({ data: { message: 'Password changed. Please sign in again.' } })
}
