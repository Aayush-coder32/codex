import { query } from '../../config/database.js'
import { companiesByIds, mapOpportunity, newId, updateParts } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

const opportunityColumns = {
  title: 'title', companyId: 'company_id', type: 'type', location: 'location', mode: 'mode',
  pay: 'pay', duration: 'duration', skills: { column: 'skills', json: true },
  preferredSkills: { column: 'preferred_skills', json: true }, deadline: 'deadline', openings: 'openings',
  eligibility: 'eligibility', experience: 'experience', description: 'description',
  responsibilities: { column: 'responsibilities', json: true }, status: 'status', publishedAt: 'published_at',
}

function buildWhere(filters, { includePrivate = false, createdBy } = {}) {
  const clauses = []
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (!includePrivate) {
    clauses.push("status = 'Active'")
    clauses.push('deadline >= NOW()')
  }
  if (createdBy) add('created_by = ?', createdBy)
  if (filters.q) add("CONCAT_WS(' ', title, location, description, skills::text) ILIKE '%' || ? || '%'", filters.q)
  if (filters.type) add('type = ?', filters.type)
  if (filters.mode) add('mode = ?', filters.mode)
  if (filters.location) add("location ILIKE '%' || ? || '%'", filters.location)
  if (filters.skill) add('EXISTS (SELECT 1 FROM jsonb_array_elements_text(skills) skill WHERE LOWER(skill) = LOWER(?))', filters.skill)
  if (includePrivate && filters.status) add('status = ?', filters.status)
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values }
}

const sortFor = (sort) => sort === 'deadline' ? 'deadline ASC' : sort === 'oldest' ? 'created_at ASC' : 'created_at DESC'

async function hydrate(rows) {
  const companyMap = await companiesByIds(rows.map((row) => row.company_id))
  return rows.map((row) => mapOpportunity(row, { company: companyMap.get(row.company_id) || null }))
}

export async function listOpportunities(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = buildWhere(req.validated?.query || req.query)
  const [records, count] = await Promise.all([
    query(`SELECT * FROM opportunities ${filter.sql} ORDER BY ${sortFor(req.query.sort)} LIMIT $${filter.values.length + 1} OFFSET $${filter.values.length + 2}`, [...filter.values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM opportunities ${filter.sql}`, filter.values),
  ])
  res.json({ data: { opportunities: await hydrate(records.rows) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function getOpportunity(req, res) {
  const result = await query(
    `UPDATE opportunities SET views = views + 1
     WHERE id = $1 AND status = 'Active' RETURNING *`,
    [req.params.id],
  )
  const row = result.rows[0]
  if (!row) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  res.json({ data: { opportunity: (await hydrate([row]))[0] } })
}

export async function listMyOpportunities(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = buildWhere(req.validated?.query || req.query, { includePrivate: true, createdBy: req.user.id })
  const [records, count] = await Promise.all([
    query(`SELECT * FROM opportunities ${filter.sql} ORDER BY ${sortFor(req.query.sort)} LIMIT $${filter.values.length + 1} OFFSET $${filter.values.length + 2}`, [...filter.values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM opportunities ${filter.sql}`, filter.values),
  ])
  res.json({ data: { opportunities: await hydrate(records.rows) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function createOpportunity(req, res) {
  const body = { ...req.validated.body }
  const companyId = req.user.role === 'admin' ? body.companyId : req.user.company
  if (!companyId || !(await query('SELECT 1 FROM companies WHERE id = $1 AND is_active = TRUE', [companyId])).rowCount) {
    throw new ApiError(422, 'A valid company is required', 'COMPANY_REQUIRED')
  }
  const result = await query(
    `INSERT INTO opportunities (
      id, title, company_id, created_by, type, location, mode, pay, duration, skills,
      preferred_skills, deadline, openings, eligibility, experience, description,
      responsibilities, status, published_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13,
      $14, $15, $16, $17::jsonb, $18, $19
    ) RETURNING *`,
    [newId(), body.title, companyId, req.user.id, body.type, body.location, body.mode, body.pay || null,
      body.duration || null, JSON.stringify(body.skills), JSON.stringify(body.preferredSkills || []), body.deadline,
      body.openings || 1, body.eligibility || null, body.experience || null, body.description,
      JSON.stringify(body.responsibilities || []), body.status || 'Draft', body.status === 'Active' ? new Date() : null],
  )
  res.status(201).json({ data: { opportunity: (await hydrate(result.rows))[0] } })
}

export async function updateOpportunity(req, res) {
  const current = (await query('SELECT * FROM opportunities WHERE id = $1', [req.validated.params.id])).rows[0]
  if (!current) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  if (req.user.role !== 'admin' && current.created_by !== req.user.id) {
    throw new ApiError(403, 'You can only update your own opportunities', 'FORBIDDEN')
  }
  const body = { ...req.validated.body }
  if (req.user.role !== 'admin') delete body.companyId
  if (body.companyId && !(await query('SELECT 1 FROM companies WHERE id = $1 AND is_active = TRUE', [body.companyId])).rowCount) {
    throw new ApiError(422, 'A valid company is required', 'COMPANY_REQUIRED')
  }
  if (body.status === 'Active' && current.status !== 'Active') body.publishedAt = new Date()
  const { assignments, values } = updateParts(body, opportunityColumns)
  const row = assignments.length
    ? (await query(`UPDATE opportunities SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [current.id, ...values])).rows[0]
    : current
  res.json({ data: { opportunity: (await hydrate([row]))[0] } })
}

export async function deleteOpportunity(req, res) {
  const current = (await query('SELECT * FROM opportunities WHERE id = $1', [req.validated.params.id])).rows[0]
  if (!current) throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  if (req.user.role !== 'admin' && current.created_by !== req.user.id) {
    throw new ApiError(403, 'You can only archive your own opportunities', 'FORBIDDEN')
  }
  await query("UPDATE opportunities SET status = 'Archived' WHERE id = $1", [current.id])
  res.status(204).end()
}

export async function listSaved(req, res) {
  const result = await query(
    `SELECT o.* FROM saved_opportunities s
     JOIN opportunities o ON o.id = s.opportunity_id
     WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
    [req.user.id],
  )
  res.json({ data: { opportunities: await hydrate(result.rows) } })
}

export async function toggleSaved(req, res) {
  const opportunityId = req.validated.params.id
  if (!(await query("SELECT 1 FROM opportunities WHERE id = $1 AND status = 'Active'", [opportunityId])).rowCount) {
    throw new ApiError(404, 'Opportunity was not found', 'OPPORTUNITY_NOT_FOUND')
  }
  const removed = await query('DELETE FROM saved_opportunities WHERE user_id = $1 AND opportunity_id = $2 RETURNING id', [req.user.id, opportunityId])
  if (removed.rowCount) return res.json({ data: { saved: false } })
  await query('INSERT INTO saved_opportunities (id, user_id, opportunity_id) VALUES ($1, $2, $3)', [newId(), req.user.id, opportunityId])
  res.status(201).json({ data: { saved: true } })
}
