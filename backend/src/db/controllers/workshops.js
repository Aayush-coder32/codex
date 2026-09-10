import { query, transaction } from '../../config/database.js'
import {
  insertNotification, institutionsByIds, mapWorkshop, mapWorkshopEnrollment,
  newId, updateParts, usersByIds, workshopsByIds,
} from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

async function hydrate(rows) {
  const [institutions, creators] = await Promise.all([
    institutionsByIds(rows.map((row) => row.institution_id)),
    usersByIds(rows.map((row) => row.created_by)),
  ])
  return rows.map((row) => mapWorkshop(row, {
    institution: institutions.get(row.institution_id) || null,
    createdBy: creators.get(row.created_by) || null,
  }))
}

export async function listWorkshops(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const clauses = []
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (req.query.status) add('status = ?', req.query.status)
  else clauses.push("status = ANY(ARRAY['Open', 'Closed', 'Completed'])")
  if (req.query.skill) add("skill ILIKE '%' || ? || '%'", req.query.skill)
  if (req.query.upcoming === 'true') clauses.push('start_date >= NOW()')
  const where = `WHERE ${clauses.join(' AND ')}`
  const [records, count] = await Promise.all([
    query(`SELECT * FROM workshops ${where} ORDER BY start_date ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM workshops ${where}`, values),
  ])
  res.json({ data: { workshops: await hydrate(records.rows) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function createWorkshop(req, res) {
  const { institutionId, ...body } = req.validated.body
  const row = (await query(
    `INSERT INTO workshops (
      id, name, skill, instructor, institution_id, created_by, start_date, duration,
      capacity, description, mode, meeting_url, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [newId(), body.name, body.skill, body.instructor, institutionId || req.user.institution || null,
      req.user.id, body.startDate, body.duration || null, body.capacity, body.description || null,
      body.mode, body.meetingUrl || null, body.status],
  )).rows[0]
  res.status(201).json({ data: { workshop: mapWorkshop(row, { includeMeetingUrl: true }) } })
}

export async function updateWorkshop(req, res) {
  const current = (await query('SELECT * FROM workshops WHERE id = $1', [req.validated.params.id])).rows[0]
  if (!current) throw new ApiError(404, 'Workshop was not found', 'WORKSHOP_NOT_FOUND')
  if (req.user.role !== 'admin' && current.created_by !== req.user.id) {
    throw new ApiError(403, 'You can only update workshops you created', 'FORBIDDEN')
  }
  const { assignments, values } = updateParts(req.validated.body, {
    name: 'name', skill: 'skill', instructor: 'instructor', institutionId: 'institution_id',
    startDate: 'start_date', duration: 'duration', capacity: 'capacity', description: 'description',
    mode: 'mode', meetingUrl: 'meeting_url', status: 'status',
  })
  const row = assignments.length
    ? (await query(`UPDATE workshops SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [current.id, ...values])).rows[0]
    : current
  res.json({ data: { workshop: mapWorkshop(row, { includeMeetingUrl: true }) } })
}

export async function enroll(req, res) {
  const workshopId = req.validated.params.id
  if ((await query('SELECT 1 FROM workshop_enrollments WHERE workshop_id = $1 AND student_id = $2', [workshopId, req.user.id])).rowCount) {
    throw new ApiError(409, 'You are already enrolled in this workshop', 'ALREADY_ENROLLED')
  }
  const result = await transaction(async (client) => {
    const execute = (text, values) => client.query(text, values)
    const workshop = (await execute(
      `UPDATE workshops SET enrolled_count = enrolled_count + 1
       WHERE id = $1 AND status = 'Open' AND start_date >= NOW() AND enrolled_count < capacity
       RETURNING *`,
      [workshopId],
    )).rows[0]
    if (!workshop) throw new ApiError(409, 'This workshop is closed, full, or unavailable', 'WORKSHOP_UNAVAILABLE')
    const enrollment = (await execute(
      'INSERT INTO workshop_enrollments (id, workshop_id, student_id) VALUES ($1, $2, $3) RETURNING *',
      [newId(), workshopId, req.user.id],
    )).rows[0]
    await insertNotification(execute, {
      recipient: req.user.id, type: 'event', title: 'Workshop registration confirmed',
      message: `You are enrolled in ${workshop.name}.`, link: '/student/dashboard', metadata: { workshopId },
    })
    return { enrollment, workshop }
  })
  res.status(201).json({ data: { enrollment: mapWorkshopEnrollment(result.enrollment), workshop: mapWorkshop(result.workshop) } })
}

export async function cancelEnrollment(req, res) {
  const result = await transaction(async (client) => {
    const enrollment = (await client.query(
      "DELETE FROM workshop_enrollments WHERE workshop_id = $1 AND student_id = $2 AND status = 'Enrolled' RETURNING *",
      [req.validated.params.id, req.user.id],
    )).rows[0]
    if (!enrollment) throw new ApiError(404, 'Active enrollment was not found', 'ENROLLMENT_NOT_FOUND')
    await client.query('UPDATE workshops SET enrolled_count = GREATEST(enrolled_count - 1, 0) WHERE id = $1', [enrollment.workshop_id])
    return enrollment
  })
  if (!result) throw new ApiError(404, 'Active enrollment was not found', 'ENROLLMENT_NOT_FOUND')
  res.status(204).end()
}

export async function listMyEnrollments(req, res) {
  const rows = (await query('SELECT * FROM workshop_enrollments WHERE student_id = $1 ORDER BY created_at DESC', [req.user.id])).rows
  const workshopMap = await workshopsByIds(rows.map((row) => row.workshop_id))
  const enrollments = rows.map((row) => mapWorkshopEnrollment(row, { workshop: workshopMap.get(row.workshop_id) || null }))
  res.json({ data: { enrollments } })
}
