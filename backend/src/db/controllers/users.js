import fs from 'node:fs/promises'
import { query } from '../../config/database.js'
import { findUserById, mapStudentProfile, mapUser, newId, updateParts, usersByIds } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'
import { publicUser } from '../../utils/serializers.js'

const profileColumns = {
  phone: 'phone', location: 'location', degree: 'degree', college: 'college', branch: 'branch',
  graduationYear: 'graduation_year', cgpa: 'cgpa', about: 'about',
  skills: { column: 'skills', json: true }, preferences: { column: 'preferences', json: true },
}

async function profileForUser(userId, { includeResumePath = false } = {}) {
  const row = (await query('SELECT * FROM student_profiles WHERE user_id = $1', [userId])).rows[0]
  if (!row) return null
  const user = await findUserById(userId)
  return mapStudentProfile(row, { user: user ? { _id: user.id, id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl } : null, includeResumePath })
}

export async function updateMe(req, res) {
  const { assignments, values } = updateParts(req.validated.body, { name: 'name', email: { column: 'email', transform: (value) => value.toLowerCase() }, avatarUrl: 'avatar_url' })
  const result = await query(`UPDATE users SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [req.user.id, ...values])
  res.json({ data: { user: publicUser(mapUser(result.rows[0])) } })
}

export async function updateSettings(req, res) {
  const incoming = req.validated.body
  const current = req.user.settings || {}
  const settings = {
    ...current,
    ...Object.fromEntries(Object.entries(incoming).filter(([key]) => key !== 'notifications')),
    notifications: { ...(current.notifications || {}), ...(incoming.notifications || {}) },
  }
  await query('UPDATE users SET settings = $2::jsonb WHERE id = $1', [req.user.id, JSON.stringify(settings)])
  res.json({ data: { settings } })
}

export async function getMyProfile(req, res) {
  const profile = await profileForUser(req.user.id)
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  res.json({ data: { profile } })
}

export async function updateMyProfile(req, res) {
  await query('INSERT INTO student_profiles (id, user_id) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING', [newId(), req.user.id])
  const { assignments, values } = updateParts(req.validated.body, profileColumns)
  if (assignments.length) await query(`UPDATE student_profiles SET ${assignments.join(', ')} WHERE user_id = $1`, [req.user.id, ...values])
  res.json({ data: { profile: await profileForUser(req.user.id) } })
}

async function updateNestedItem(req, res, { field, key, missingCode }) {
  const row = (await query(`SELECT ${field} FROM student_profiles WHERE user_id = $1`, [req.user.id])).rows[0]
  const items = row?.[field] || []
  const index = items.findIndex((item) => item._id === req.validated.params.id || item.id === req.validated.params.id)
  if (index < 0) throw new ApiError(404, `${key} was not found`, missingCode)
  items[index] = { ...items[index], ...req.validated.body, updatedAt: new Date().toISOString() }
  await query(`UPDATE student_profiles SET ${field} = $2::jsonb WHERE user_id = $1`, [req.user.id, JSON.stringify(items)])
  res.json({ data: { [key.toLowerCase()]: items[index] } })
}

async function deleteNestedItem(req, res, { field, key, missingCode }) {
  const row = (await query(`SELECT ${field} FROM student_profiles WHERE user_id = $1`, [req.user.id])).rows[0]
  const items = row?.[field] || []
  const filtered = items.filter((item) => item._id !== req.validated.params.id && item.id !== req.validated.params.id)
  if (filtered.length === items.length) throw new ApiError(404, `${key} was not found`, missingCode)
  await query(`UPDATE student_profiles SET ${field} = $2::jsonb WHERE user_id = $1`, [req.user.id, JSON.stringify(filtered)])
  res.status(204).end()
}

async function addNestedItem(req, res, { field, key }) {
  const row = (await query(`SELECT ${field} FROM student_profiles WHERE user_id = $1`, [req.user.id])).rows[0]
  if (!row) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  const now = new Date().toISOString()
  const id = newId()
  const item = { _id: id, id, ...req.validated.body, createdAt: now, updatedAt: now }
  const items = [item, ...(row[field] || [])]
  await query(`UPDATE student_profiles SET ${field} = $2::jsonb WHERE user_id = $1`, [req.user.id, JSON.stringify(items)])
  res.status(201).json({ data: { [key]: item } })
}

export const addProject = (req, res) => addNestedItem(req, res, { field: 'projects', key: 'project' })
export const updateProject = (req, res) => updateNestedItem(req, res, { field: 'projects', key: 'Project', missingCode: 'PROJECT_NOT_FOUND' })
export const deleteProject = (req, res) => deleteNestedItem(req, res, { field: 'projects', key: 'Project', missingCode: 'PROJECT_NOT_FOUND' })
export const addCertificate = (req, res) => addNestedItem(req, res, { field: 'certificates', key: 'certificate' })
export const updateCertificate = (req, res) => updateNestedItem(req, res, { field: 'certificates', key: 'Certificate', missingCode: 'CERTIFICATE_NOT_FOUND' })
export const deleteCertificate = (req, res) => deleteNestedItem(req, res, { field: 'certificates', key: 'Certificate', missingCode: 'CERTIFICATE_NOT_FOUND' })

export async function uploadResume(req, res) {
  if (!req.file) throw new ApiError(400, 'A PDF resume is required', 'RESUME_REQUIRED')
  const profile = await profileForUser(req.user.id, { includeResumePath: true })
  if (!profile) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  const previousPath = profile.resume?.path
  const resume = {
    path: req.file.path, originalName: req.file.originalname, mimeType: req.file.mimetype,
    size: req.file.size, uploadedAt: new Date().toISOString(),
  }
  await query('UPDATE student_profiles SET resume = $2::jsonb WHERE user_id = $1', [req.user.id, JSON.stringify(resume)])
  if (previousPath) await fs.unlink(previousPath).catch(() => {})
  const { path, ...publicResume } = resume
  res.status(201).json({ data: { resume: publicResume } })
}

export async function downloadResume(req, res) {
  const profile = await profileForUser(req.user.id, { includeResumePath: true })
  if (!profile?.resume?.path) throw new ApiError(404, 'No resume has been uploaded', 'RESUME_NOT_FOUND')
  res.download(profile.resume.path, profile.resume.originalName)
}

function studentWhere(requestQuery) {
  const clauses = []
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (requestQuery.skill) add("EXISTS (SELECT 1 FROM jsonb_array_elements(sp.skills) skill WHERE LOWER(skill->>'name') = LOWER(?))", requestQuery.skill)
  if (requestQuery.graduationYear) add('sp.graduation_year = ?', Number(requestQuery.graduationYear))
  if (requestQuery.q) add("CONCAT_WS(' ', sp.college, sp.branch, sp.location) ILIKE '%' || ? || '%'", requestQuery.q)
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values }
}

export async function listStudents(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = studentWhere(req.query)
  const [rows, count] = await Promise.all([
    query(`SELECT sp.* FROM student_profiles sp ${filter.sql} ORDER BY sp.readiness DESC LIMIT $${filter.values.length + 1} OFFSET $${filter.values.length + 2}`, [...filter.values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM student_profiles sp ${filter.sql}`, filter.values),
  ])
  const userMap = await usersByIds(rows.rows.map((row) => row.user_id))
  const students = rows.rows.map((row) => mapStudentProfile(row, { user: userMap.get(row.user_id) || null }))
  res.json({ data: { students }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function getStudent(req, res) {
  const row = (await query('SELECT * FROM student_profiles WHERE id = $1', [req.params.id])).rows[0]
  if (!row) throw new ApiError(404, 'Student profile was not found', 'PROFILE_NOT_FOUND')
  const user = await findUserById(row.user_id)
  res.json({ data: { profile: mapStudentProfile(row, { user }) } })
}
