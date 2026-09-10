import { query } from '../../config/database.js'
import { mapCompany, updateParts } from '../records.js'
import { ApiError } from '../../utils/ApiError.js'
import { getPagination, pageMeta } from '../../utils/pagination.js'

export async function listCompanies(req, res) {
  const { page, limit, skip } = getPagination(req.query)
  const values = []
  let search = ''
  if (req.query.q) {
    values.push(req.query.q)
    search = " AND CONCAT_WS(' ', name, industry, headquarters) ILIKE '%' || $1 || '%'"
  }
  const [records, count] = await Promise.all([
    query(`SELECT * FROM companies WHERE is_active = TRUE${search} ORDER BY verified DESC, name ASC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, limit, skip]),
    query(`SELECT COUNT(*)::int AS total FROM companies WHERE is_active = TRUE${search}`, values),
  ])
  res.json({ data: { companies: records.rows.map(mapCompany) }, meta: pageMeta(count.rows[0].total, page, limit) })
}

export async function getCompany(req, res) {
  const company = mapCompany((await query('SELECT * FROM companies WHERE id = $1 AND is_active = TRUE', [req.params.id])).rows[0])
  if (!company) throw new ApiError(404, 'Company was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company } })
}

export async function getMyCompany(req, res) {
  const company = mapCompany((await query('SELECT * FROM companies WHERE id = $1', [req.user.company])).rows[0])
  if (!company) throw new ApiError(404, 'Company profile was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company } })
}

export async function updateMyCompany(req, res) {
  const { assignments, values } = updateParts(req.validated.body, {
    name: 'name', industry: 'industry', employeeCount: 'employee_count', headquarters: 'headquarters',
    website: 'website', about: 'about', logoUrl: 'logo_url',
  })
  const row = assignments.length
    ? (await query(`UPDATE companies SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, [req.user.company, ...values])).rows[0]
    : (await query('SELECT * FROM companies WHERE id = $1', [req.user.company])).rows[0]
  if (!row) throw new ApiError(404, 'Company profile was not found', 'COMPANY_NOT_FOUND')
  res.json({ data: { company: mapCompany(row) } })
}
