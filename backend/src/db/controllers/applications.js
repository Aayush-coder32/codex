import { query, transaction } from '../../config/database.js'
import {
  companiesByIds, insertNotification, mapApplication, mapOpportunity, mapStudentProfile,
  newId, opportunitiesByIds, usersByIds,
} from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

const allowedTransitions = {
  Applied: ['Under Review', 'Shortlisted', 'Rejected'],
  'Under Review': ['Shortlisted', 'Interview', 'Rejected'],
  Shortlisted: ['Interview', 'Selected', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: [], Rejected: [], Withdrawn: [],
}

function scoreMatch(profile, opportunity) {
  const studentSkills = new Set((profile?.skills || []).map((skill) => skill.name.toLowerCase()))
  const required = opportunity.skills.map((skill) => skill.toLowerCase())
  if (!required.length) return 0
  return Math.round(required.filter((skill) => studentSkills.has(skill)).length / required.length * 100)
}

async function hydrate(rows, { includeStudents = false } = {}) {
  const opportunityRows = await query('SELECT * FROM opportunities WHERE id = ANY($1::text[])', [[...new Set(rows.map((row) => row.opportunity_id))]])
  const companyMap = await companiesByIds(opportunityRows.rows.map((row) => row.company_id))
  const opportunityMap = new Map(opportunityRows.rows.map((row) => [row.id, mapOpportunity(row, { company: companyMap.get(row.company_id) || null })]))
  const studentMap = includeStudents ? await usersByIds(rows.map((row) => row.student_id)) : new Map()
  return rows.map((row) => mapApplication(row, {
    opportunity: opportunityMap.get(row.opportunity_id) || null,
    ...(includeStudents ? { student: studentMap.get(row.student_id) || null } : {}),
  }))
}

export async function apply(req, res) {
  const { opportunityId, coverLetter } = req.validated.body
  const opportunityRow = (await query(
    "SELECT * FROM opportunities WHERE id = $1 AND status = 'Active' AND deadline >= NOW()",
    [opportunityId],
  )).rows[0]
  if (!opportunityRow) throw new ApiError(404, 'This opportunity is unavailable or closed', 'OPPORTUNITY_UNAVAILABLE')
  if ((await query('SELECT 1 FROM applications WHERE opportunity_id = $1 AND student_id = $2', [opportunityId, req.user.id])).rowCount) {
    throw new ApiError(409, 'You have already applied to this opportunity', 'ALREADY_APPLIED')
  }

  const profileRow = (await query('SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id])).rows[0]
  const opportunity = mapOpportunity(opportunityRow)
  const profile = mapStudentProfile(profileRow)
  const application = await transaction(async (client) => {
    const execute = (text, values) => client.query(text, values)
    const id = newId()
    const history = [{ status: 'Applied', changedBy: req.user.id, at: new Date().toISOString() }]
    const resumeSnapshot = profile?.resume?.originalName
      ? { originalName: profile.resume.originalName, uploadedAt: profile.resume.uploadedAt }
      : null
    const result = await execute(
      `INSERT INTO applications (id, opportunity_id, student_id, cover_letter, match_score, resume_snapshot, history)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb) RETURNING *`,
      [id, opportunityId, req.user.id, coverLetter || null, scoreMatch(profile, opportunity), JSON.stringify(resumeSnapshot), JSON.stringify(history)],
    )
    await execute('UPDATE opportunities SET application_count = application_count + 1 WHERE id = $1', [opportunityId])
    await insertNotification(execute, {
      recipient: opportunityRow.created_by, type: 'opportunity', title: 'New application received',
      message: `${req.user.name} applied for ${opportunity.title}.`, link: '/company/applications',
      metadata: { applicationId: id, opportunityId },
    })
    return result.rows[0]
  })
  res.status(201).json({ data: { application: (await hydrate([application]))[0] } })
}

export async function listMine(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const values = [req.user.id]
  let statusSql = ''
  if (req.query.status) {
    values.push(req.query.status)
    statusSql = ` AND status = $${values.length}`
  }
  const [records, count] = await Promise.all([
    query(`SELECT * FROM applications WHERE student_id = $1${statusSql} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM applications WHERE student_id = $1${statusSql}`, values),
  ])
  res.json({ data: { applications: await hydrate(records.rows) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function withdraw(req, res) {
  const row = (await query('SELECT * FROM applications WHERE id = $1 AND student_id = $2', [req.validated.params.id, req.user.id])).rows[0]
  if (!row) throw new ApiError(404, 'Application was not found', 'APPLICATION_NOT_FOUND')
  if (['Selected', 'Rejected', 'Withdrawn'].includes(row.status)) {
    throw new ApiError(409, 'This application can no longer be withdrawn', 'INVALID_STATUS_TRANSITION')
  }
  const history = [...(row.history || []), { status: 'Withdrawn', changedBy: req.user.id, at: new Date().toISOString() }]
  const updated = (await query(
    "UPDATE applications SET status = 'Withdrawn', history = $2::jsonb WHERE id = $1 RETURNING *",
    [row.id, JSON.stringify(history)],
  )).rows[0]
  res.json({ data: { application: mapApplication(updated) } })
}

function applicantFilter(req) {
  const clauses = []
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (req.user.role !== 'admin') add('o.created_by = ?', req.user.id)
  if (req.query.opportunityId) add('o.id = ?', req.query.opportunityId)
  if (req.query.status) add('a.status = ?', req.query.status)
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values }
}

export async function listApplicants(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const filter = applicantFilter(req)
  const [records, count] = await Promise.all([
    query(
      `SELECT a.* FROM applications a JOIN opportunities o ON o.id = a.opportunity_id
       ${filter.sql} ORDER BY a.match_score DESC, a.created_at DESC
       LIMIT $${filter.values.length + 1} OFFSET $${filter.values.length + 2}`,
      [...filter.values, limit, skip],
    ),
    query(`SELECT COUNT(*)::int AS total FROM applications a JOIN opportunities o ON o.id = a.opportunity_id ${filter.sql}`, filter.values),
  ])
  const applications = await hydrate(records.rows, { includeStudents: true })
  const profileRows = await query('SELECT * FROM student_profiles WHERE user_id = ANY($1::text[])', [records.rows.map((row) => row.student_id)])
  const profiles = new Map(profileRows.rows.map((row) => [row.user_id, mapStudentProfile(row)]))
  const enriched = applications.map((application, index) => ({ ...application, profile: profiles.get(records.rows[index].student_id) || null }))
  res.json({ data: { applications: enriched }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function updateStatus(req, res) {
  const row = (await query(
    `SELECT a.*, o.created_by AS opportunity_created_by, o.title AS opportunity_title
     FROM applications a JOIN opportunities o ON o.id = a.opportunity_id WHERE a.id = $1`,
    [req.validated.params.id],
  )).rows[0]
  if (!row) throw new ApiError(404, 'Application was not found', 'APPLICATION_NOT_FOUND')
  if (req.user.role !== 'admin' && row.opportunity_created_by !== req.user.id) {
    throw new ApiError(403, 'You can only manage applicants for your opportunities', 'FORBIDDEN')
  }
  const { status, note } = req.validated.body
  if (!allowedTransitions[row.status]?.includes(status)) {
    throw new ApiError(409, `Cannot move an application from ${row.status} to ${status}`, 'INVALID_STATUS_TRANSITION')
  }
  const history = [...(row.history || []), { status, note, changedBy: req.user.id, at: new Date().toISOString() }]
  const updated = await transaction(async (client) => {
    const execute = (text, values) => client.query(text, values)
    const result = await execute('UPDATE applications SET status = $2, history = $3::jsonb WHERE id = $1 RETURNING *', [row.id, status, JSON.stringify(history)])
    await insertNotification(execute, {
      recipient: row.student_id, type: status === 'Rejected' ? 'warning' : 'success', title: 'Application status updated',
      message: `Your application for ${row.opportunity_title} is now ${status}.`,
      link: '/student/applications', metadata: { applicationId: row.id },
    })
    return result.rows[0]
  })
  res.json({ data: { application: mapApplication(updated) } })
}
