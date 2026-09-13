import bcrypt from 'bcryptjs'
import { ApiError } from '../utils/ApiError.js'
import { LeetCodeAccount } from '../models/LeetCodeAccount.js'

function responseAccount(account) {
  return { id: account.id, name: account.name, username: account.username, email: account.email }
}

export async function getAccount(req, res) {
  const account = await LeetCodeAccount.findOne({ user: req.user._id })
  res.json({ data: { account: account?.sessionActive ? responseAccount(account) : null, registered: Boolean(account) } })
}

export async function register(req, res) {
  if (await LeetCodeAccount.exists({ user: req.user._id })) throw new ApiError(409, 'A LeetCode account is already registered for this profile', 'LEETCODE_ACCOUNT_EXISTS')
  const account = await LeetCodeAccount.create({
    user: req.user._id,
    ...req.validated.body,
    passwordHash: await bcrypt.hash(req.validated.body.password, 12),
    sessionActive: true,
    lastLoginAt: new Date(),
  })
  res.status(201).json({ data: { account: responseAccount(account) } })
}

export async function login(req, res) {
  const account = await LeetCodeAccount.findOne({ user: req.user._id, email: req.validated.body.email }).select('+passwordHash')
  if (!account) throw new ApiError(404, 'No LeetCode account was found. Please sign up first.', 'LEETCODE_ACCOUNT_NOT_FOUND')
  if (!(await bcrypt.compare(req.validated.body.password, account.passwordHash))) throw new ApiError(401, 'Password is incorrect. Please try again.', 'INVALID_LEETCODE_CREDENTIALS')
  account.sessionActive = true
  account.lastLoginAt = new Date()
  await account.save()
  res.json({ data: { account: responseAccount(account) } })
}

export async function logout(req, res) {
  await LeetCodeAccount.updateOne({ user: req.user._id }, { $set: { sessionActive: false } })
  res.status(204).end()
}
