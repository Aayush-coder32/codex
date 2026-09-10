import { query } from '../../config/database.js'
import { mapAnnouncement, newId, updateParts, usersByIds } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

const audienceForRole = { student: 'students', faculty: 'faculty', company: 'companies', admin: 'everyone' }

async function listWithFilter(req, res, { audiences, status, activeOnly = false } = {}) {
  const { page, limit, skip } = getPagination(req.query)
  const clauses = []
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (status) add('status = ?', status)
  if (audiences?.length) add('audience = ANY(?::text[])', audiences)
  if (activeOnly) clauses.push('(expires_at IS NULL OR expires_at > NOW())')
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [records, count] = await Promise.all([
    query(`SELECT * FROM announcements ${where} ORDER BY published_at DESC NULLS LAST, created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM announcements ${where}`, values),
  ])
  const authors = await usersByIds(records.rows.map((row) => row.author_id))
  const announcements = records.rows.map((row) => mapAnnouncement(row, { author: authors.get(row.author_id) || null }))
  res.json({ data: { announcements }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export const listPublic = (req, res) => listWithFilter(req, res, { audiences: ['everyone'], status: 'Published', activeOnly: true })

export function listFeed(req, res) {
  const audiences = req.user.role === 'admin' ? undefined : ['everyone', audienceForRole[req.user.role]]
  return listWithFilter(req, res, { audiences, status: 'Published', activeOnly: true })
}

export const listAll = (req, res) => listWithFilter(req, res, { status: req.query.status })

export async function createAnnouncement(req, res) {
  const body = req.validated.body
  const row = (await query(
    `INSERT INTO announcements (id, title, message, audience, author_id, status, published_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [newId(), body.title, body.message, body.audience, req.user.id, body.status, body.status === 'Published' ? new Date() : null, body.expiresAt || null],
  )).rows[0]
  res.status(201).json({ data: { announcement: mapAnnouncement(row) } })
}

export async function updateAnnouncement(req, res) {
  const current = (await query('SELECT * FROM announcements WHERE id = $1', [req.validated.params.id])).rows[0]
  if (!current) throw new ApiError(404, 'Announcement was not found', 'ANNOUNCEMENT_NOT_FOUND')
  const body = { ...req.validated.body }
  if (body.status === 'Published' && current.status !== 'Published') body.publishedAt = new Date()
  const { assignments, values } = updateParts(body, {
    title: 'title', message: 'message', audience: 'audience', status: 'status',
    publishedAt: 'published_at', expiresAt: 'expires_at',
  })
  const row = assignments.length
    ? (await query(`UPDATE announcements SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [current.id, ...values])).rows[0]
    : current
  res.json({ data: { announcement: mapAnnouncement(row) } })
}

export async function deleteAnnouncement(req, res) {
  const result = await query('DELETE FROM announcements WHERE id = $1 RETURNING id', [req.validated.params.id])
  if (!result.rowCount) throw new ApiError(404, 'Announcement was not found', 'ANNOUNCEMENT_NOT_FOUND')
  res.status(204).end()
}
