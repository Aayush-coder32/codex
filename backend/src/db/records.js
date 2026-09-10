import crypto from 'node:crypto'
import { query } from '../config/database.js'

export const newId = () => crypto.randomBytes(12).toString('hex')

const jsonValue = (value, fallback) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return fallback }
  }
  return value
}

const base = (row) => ({
  _id: row.id,
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export function mapCompany(row) {
  if (!row) return null
  return {
    ...base(row), name: row.name, slug: row.slug, industry: row.industry,
    employeeCount: row.employee_count, headquarters: row.headquarters, website: row.website,
    about: row.about, logoUrl: row.logo_url, verified: row.verified, isActive: row.is_active,
  }
}

export function mapInstitution(row) {
  if (!row) return null
  return {
    ...base(row), name: row.name, code: row.code, type: row.type, city: row.city,
    state: row.state, website: row.website, verified: row.verified, isActive: row.is_active,
  }
}

export function mapUser(row, { includeSecrets = false, company, institution } = {}) {
  if (!row) return null
  const user = {
    ...base(row), name: row.name, email: row.email, role: row.role, avatarUrl: row.avatar_url,
    company: company === undefined ? row.company_id : company,
    institution: institution === undefined ? row.institution_id : institution,
    isActive: row.is_active, emailVerified: row.email_verified, lastLoginAt: row.last_login_at,
    settings: jsonValue(row.settings, {}),
  }
  if (includeSecrets) {
    user.passwordHash = row.password_hash
    user.passwordResetTokenHash = row.password_reset_token_hash
    user.passwordResetExpiresAt = row.password_reset_expires_at
  }
  return user
}

export function mapStudentProfile(row, { user, includeResumePath = false } = {}) {
  if (!row) return null
  const resume = jsonValue(row.resume, null)
  if (resume && !includeResumePath) delete resume.path
  return {
    ...base(row), user: user === undefined ? row.user_id : user, phone: row.phone,
    location: row.location, degree: row.degree, college: row.college, branch: row.branch,
    graduationYear: row.graduation_year, cgpa: row.cgpa === null ? null : Number(row.cgpa),
    about: row.about, skills: jsonValue(row.skills, []), projects: jsonValue(row.projects, []),
    certificates: jsonValue(row.certificates, []), resume,
    preferences: jsonValue(row.preferences, {}), readiness: row.readiness,
  }
}

export function mapOpportunity(row, { company } = {}) {
  if (!row) return null
  return {
    ...base(row), title: row.title, company: company === undefined ? row.company_id : company,
    createdBy: row.created_by, type: row.type, location: row.location, mode: row.mode,
    pay: row.pay, duration: row.duration, skills: jsonValue(row.skills, []),
    preferredSkills: jsonValue(row.preferred_skills, []), deadline: row.deadline,
    openings: row.openings, eligibility: row.eligibility, experience: row.experience,
    description: row.description, responsibilities: jsonValue(row.responsibilities, []),
    status: row.status, stats: { views: row.views, applications: row.application_count },
    publishedAt: row.published_at,
  }
}

export function mapApplication(row, { opportunity, student } = {}) {
  if (!row) return null
  return {
    ...base(row), opportunity: opportunity === undefined ? row.opportunity_id : opportunity,
    student: student === undefined ? row.student_id : student, status: row.status,
    matchScore: row.match_score, coverLetter: row.cover_letter,
    resumeSnapshot: jsonValue(row.resume_snapshot, null), history: jsonValue(row.history, []),
  }
}

export function mapWorkshop(row, { institution, createdBy } = {}) {
  if (!row) return null
  return {
    ...base(row), name: row.name, skill: row.skill, instructor: row.instructor,
    institution: institution === undefined ? row.institution_id : institution,
    createdBy: createdBy === undefined ? row.created_by : createdBy,
    startDate: row.start_date, duration: row.duration, capacity: row.capacity,
    enrolledCount: row.enrolled_count, description: row.description, mode: row.mode,
    meetingUrl: row.meeting_url, status: row.status,
  }
}

export function mapWorkshopEnrollment(row, { workshop } = {}) {
  if (!row) return null
  return {
    ...base(row), workshop: workshop === undefined ? row.workshop_id : workshop,
    student: row.student_id, status: row.status, completedAt: row.completed_at,
  }
}

export function mapNotification(row) {
  if (!row) return null
  return {
    ...base(row), recipient: row.recipient_id, type: row.type, title: row.title,
    message: row.message, link: row.link, metadata: jsonValue(row.metadata, {}), readAt: row.read_at,
  }
}

export function mapAnnouncement(row, { author } = {}) {
  if (!row) return null
  return {
    ...base(row), title: row.title, message: row.message, audience: row.audience,
    author: author === undefined ? row.author_id : author, status: row.status,
    publishedAt: row.published_at, expiresAt: row.expires_at,
  }
}

export function mapConversation(row, { participants, lastMessage } = {}) {
  if (!row) return null
  return {
    ...base(row), participants: participants || [], title: row.title,
    lastMessageAt: row.last_message_at, ...(lastMessage !== undefined ? { lastMessage } : {}),
  }
}

export function mapMessage(row, { sender } = {}) {
  if (!row) return null
  return {
    ...base(row), conversation: row.conversation_id,
    sender: sender === undefined ? row.sender_id : sender, text: row.text,
    attachments: jsonValue(row.attachments, []), readBy: jsonValue(row.read_by, []),
  }
}

export async function findUserById(id, { includeSecrets = false, includeRelations = false, executor = query } = {}) {
  const result = await executor('SELECT * FROM users WHERE id = $1', [id])
  const row = result.rows[0]
  if (!row) return null
  let company
  let institution
  if (includeRelations) {
    if (row.company_id) company = mapCompany((await executor('SELECT * FROM companies WHERE id = $1', [row.company_id])).rows[0])
    if (row.institution_id) institution = mapInstitution((await executor('SELECT * FROM institutions WHERE id = $1', [row.institution_id])).rows[0])
  }
  return mapUser(row, { includeSecrets, company, institution })
}

export async function findUserByEmail(email, { includeSecrets = false, executor = query } = {}) {
  const result = await executor('SELECT * FROM users WHERE email = LOWER($1)', [email])
  return mapUser(result.rows[0], { includeSecrets })
}

async function recordsByIds(table, ids, mapper, executor = query) {
  const uniqueIds = [...new Set(ids.filter(Boolean))]
  if (!uniqueIds.length) return new Map()
  const result = await executor(`SELECT * FROM ${table} WHERE id = ANY($1::text[])`, [uniqueIds])
  return new Map(result.rows.map((row) => [row.id, mapper(row)]))
}

export const usersByIds = (ids, executor) => recordsByIds('users', ids, mapUser, executor)
export const companiesByIds = (ids, executor) => recordsByIds('companies', ids, mapCompany, executor)
export const institutionsByIds = (ids, executor) => recordsByIds('institutions', ids, mapInstitution, executor)
export const opportunitiesByIds = (ids, executor) => recordsByIds('opportunities', ids, mapOpportunity, executor)
export const workshopsByIds = (ids, executor) => recordsByIds('workshops', ids, mapWorkshop, executor)

export function updateParts(input, mapping, startAt = 2) {
  const assignments = []
  const values = []
  for (const [key, config] of Object.entries(mapping)) {
    if (input[key] === undefined) continue
    const definition = typeof config === 'string' ? { column: config } : config
    const value = definition.json ? JSON.stringify(input[key]) : input[key]
    values.push(definition.transform ? definition.transform(value) : value)
    assignments.push(`${definition.column} = $${startAt + values.length - 1}`)
  }
  return { assignments, values }
}

export async function insertNotification(executor, data) {
  const id = newId()
  const result = await executor(
    `INSERT INTO notifications (id, recipient_id, type, title, message, link, metadata, read_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8) RETURNING *`,
    [id, data.recipient, data.type || 'info', data.title, data.message, data.link || null, JSON.stringify(data.metadata || {}), data.readAt || null],
  )
  return mapNotification(result.rows[0])
}
