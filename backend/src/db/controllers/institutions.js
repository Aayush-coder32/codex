import { query } from '../../config/database.js'
import { mapInstitution, newId, updateParts } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

export async function listInstitutions(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const clauses = req.user?.role === 'admin' ? [] : ['is_active = TRUE']
  const values = []
  const add = (sql, value) => { values.push(value); clauses.push(sql.replace('?', `$${values.length}`)) }
  if (req.query.q) add("CONCAT_WS(' ', name, city, state) ILIKE '%' || ? || '%'", req.query.q)
  if (req.query.state) add("state ILIKE '%' || ? || '%'", req.query.state)
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  const [records, count] = await Promise.all([
    query(`SELECT * FROM institutions ${where} ORDER BY verified DESC, name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM institutions ${where}`, values),
  ])
  res.json({ data: { institutions: records.rows.map(mapInstitution) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function createInstitution(req, res) {
  const body = req.validated.body
  const result = await query(
    `INSERT INTO institutions (id, name, code, type, city, state, website, verified, is_active)
     VALUES ($1, $2, UPPER($3), $4, $5, $6, $7, $8, $9) RETURNING *`,
    [newId(), body.name, body.code, body.type, body.city || null, body.state || null, body.website || null, body.verified, body.isActive],
  )
  res.status(201).json({ data: { institution: mapInstitution(result.rows[0]) } })
}

export async function updateInstitution(req, res) {
  const { assignments, values } = updateParts(req.validated.body, {
    name: 'name', code: { column: 'code', transform: (value) => value.toUpperCase() }, type: 'type',
    city: 'city', state: 'state', website: 'website', verified: 'verified', isActive: 'is_active',
  })
  const row = assignments.length
    ? (await query(`UPDATE institutions SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [req.validated.params.id, ...values])).rows[0]
    : (await query('SELECT * FROM institutions WHERE id = $1', [req.validated.params.id])).rows[0]
  if (!row) throw new ApiError(404, 'Institution was not found', 'INSTITUTION_NOT_FOUND')
  res.json({ data: { institution: mapInstitution(row) } })
}
