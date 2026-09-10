import { query } from '../../config/database.js'

async function adminOverview(res) {
  const result = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE role = 'student' AND is_active = TRUE) AS students,
      (SELECT COUNT(*)::int FROM institutions WHERE is_active = TRUE) AS institutions,
      (SELECT COUNT(*)::int FROM companies WHERE is_active = TRUE) AS companies,
      (SELECT COUNT(*)::int FROM opportunities WHERE status = 'Active') AS active_opportunities,
      (SELECT COUNT(*)::int FROM applications) AS applications,
      (SELECT COUNT(*)::int FROM applications WHERE status = 'Selected') AS placements,
      (SELECT COUNT(*)::int FROM workshops) AS workshops
  `)
  const row = result.rows[0]
  const placementRate = row.applications ? Math.round(row.placements / row.applications * 100) : 0
  res.json({ data: { role: 'admin', metrics: {
    students: row.students, institutions: row.institutions, companies: row.companies,
    activeOpportunities: row.active_opportunities, applications: row.applications,
    placements: row.placements, placementRate, workshops: row.workshops,
  } } })
}

async function companyOverview(req, res) {
  const row = (await query(`
    SELECT
      COUNT(DISTINCT o.id)::int AS opportunities,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'Active')::int AS active_opportunities,
      COUNT(a.id)::int AS applications,
      COUNT(a.id) FILTER (WHERE a.status IN ('Shortlisted', 'Interview'))::int AS shortlisted,
      COUNT(a.id) FILTER (WHERE a.status = 'Selected')::int AS selected
    FROM opportunities o LEFT JOIN applications a ON a.opportunity_id = o.id
    WHERE o.created_by = $1
  `, [req.user.id])).rows[0]
  res.json({ data: { role: 'company', metrics: {
    opportunities: row.opportunities, activeOpportunities: row.active_opportunities,
    applications: row.applications, shortlisted: row.shortlisted, selected: row.selected,
  } } })
}

async function studentOverview(req, res) {
  const row = (await query(`
    SELECT
      COALESCE(sp.readiness, 0)::int AS readiness,
      COALESCE(jsonb_array_length(sp.projects), 0)::int AS projects,
      COALESCE(jsonb_array_length(sp.certificates), 0)::int AS certificates,
      (SELECT COUNT(*)::int FROM applications WHERE student_id = $1) AS applications,
      (SELECT COUNT(*)::int FROM applications WHERE student_id = $1 AND status NOT IN ('Rejected', 'Selected', 'Withdrawn')) AS active_applications,
      (SELECT COUNT(*)::int FROM saved_opportunities WHERE user_id = $1) AS saved
    FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = $1
  `, [req.user.id])).rows[0]
  res.json({ data: { role: 'student', metrics: {
    readiness: row?.readiness || 0, applications: row?.applications || 0,
    activeApplications: row?.active_applications || 0, saved: row?.saved || 0,
    projects: row?.projects || 0, certificates: row?.certificates || 0,
  } } })
}

async function facultyOverview(req, res) {
  const institutionClause = req.user.institution ? 'AND u.institution_id = $2' : ''
  const values = req.user.institution ? [req.user.id, req.user.institution] : [req.user.id]
  const row = (await query(`
    WITH faculty_students AS (
      SELECT u.id FROM users u WHERE u.role = 'student' ${institutionClause}
    )
    SELECT
      (SELECT COUNT(*)::int FROM student_profiles sp JOIN faculty_students fs ON fs.id = sp.user_id) AS students,
      (SELECT COUNT(*)::int FROM student_profiles sp JOIN faculty_students fs ON fs.id = sp.user_id WHERE sp.readiness >= 75) AS placement_ready,
      (SELECT COUNT(*)::int FROM applications a JOIN faculty_students fs ON fs.id = a.student_id) AS applications,
      (SELECT COUNT(*)::int FROM workshops WHERE created_by = $1) AS workshops
  `, values)).rows[0]
  res.json({ data: { role: 'faculty', metrics: {
    students: row.students, placementReady: row.placement_ready,
    applications: row.applications, workshops: row.workshops,
  } } })
}

export async function overview(req, res) {
  if (req.user.role === 'admin') return adminOverview(res)
  if (req.user.role === 'company') return companyOverview(req, res)
  if (req.user.role === 'faculty') return facultyOverview(req, res)
  return studentOverview(req, res)
}

export async function skillDemand(_req, res) {
  const result = await query(`
    SELECT LOWER(skill) AS skill, COUNT(*)::int AS demand
    FROM opportunities, jsonb_array_elements_text(skills) AS skill
    WHERE status = 'Active' AND deadline >= NOW()
    GROUP BY LOWER(skill)
    ORDER BY demand DESC, skill ASC
    LIMIT 20
  `)
  res.json({ data: { skills: result.rows } })
}
