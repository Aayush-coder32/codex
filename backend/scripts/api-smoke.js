import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { app } from '../src/app.js'
import { connectDatabase, disconnectDatabase, query } from '../src/config/database.js'
import { newId } from '../src/db/records.js'

let server
const created = { users: [], companies: [], institutions: [], opportunities: [], workshops: [], conversations: [], announcements: [] }

async function request(baseUrl, path, { token, method = 'GET', body } = {}) {
  const headers = {}
  if (token) headers.authorization = `Bearer ${token}`
  if (body !== undefined) headers['content-type'] = 'application/json'
  const response = await fetch(`${baseUrl}${path}`, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
  const responseBody = response.status === 204 ? null : await response.json()
  return { response, body: responseBody }
}

function expect(result, status, label) {
  assert.equal(result.response.status, status, `${label}: ${JSON.stringify(result.body)}`)
  return result.body?.data
}

async function register(baseUrl, suffix, role, organizationName) {
  const result = await request(baseUrl, '/api/v1/auth/register', {
    method: 'POST',
    body: {
      name: `Migration ${role}`, email: `migration-${suffix}-${Date.now()}@skillbridge.invalid`,
      password: 'MigrationCheck123!', role, ...(organizationName ? { organizationName } : {}),
    },
  })
  const data = expect(result, 201, `register ${role}`)
  created.users.push(data.user.id)
  if (data.user.company) created.companies.push(data.user.company)
  return { ...data.user, token: data.accessToken }
}

async function smoke() {
  await connectDatabase()
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  const student = await register(baseUrl, 'student', 'student')
  const company = await register(baseUrl, 'company', 'company', `Migration Company ${Date.now()}`)
  const faculty = await register(baseUrl, 'faculty', 'faculty')
  const adminId = newId()
  const adminEmail = `migration-admin-${Date.now()}@skillbridge.invalid`
  await query(
    `INSERT INTO users (id, name, email, password_hash, role, email_verified)
     VALUES ($1, 'Migration Admin', $2, $3, 'admin', TRUE)`,
    [adminId, adminEmail, await bcrypt.hash('MigrationCheck123!', 12)],
  )
  created.users.push(adminId)
  const adminLogin = expect(await request(baseUrl, '/api/v1/auth/login', {
    method: 'POST', body: { email: adminEmail, password: 'MigrationCheck123!' },
  }), 200, 'admin login')
  const admin = { id: adminId, token: adminLogin.accessToken }

  for (const [path, token] of [
    ['/health/ready'], ['/api/v1/auth/me', student.token], ['/api/v1/students/me', student.token],
    ['/api/v1/analytics/overview', student.token], ['/api/v1/opportunities'], ['/api/v1/companies'],
    ['/api/v1/institutions'], ['/api/v1/announcements'],
  ]) expect(await request(baseUrl, path, { token }), 200, path)

  expect(await request(baseUrl, '/api/v1/students/me', {
    token: student.token, method: 'PATCH', body: { degree: 'B.Tech', skills: [{ name: 'PostgreSQL', level: 80 }] },
  }), 200, 'profile update')
  const project = expect(await request(baseUrl, '/api/v1/students/me/projects', {
    token: student.token, method: 'POST', body: { title: 'Migration project', description: 'PostgreSQL smoke test', technologies: ['Node.js', 'PostgreSQL'] },
  }), 201, 'project create').project
  expect(await request(baseUrl, `/api/v1/students/me/projects/${project.id}`, {
    token: student.token, method: 'PATCH', body: { description: 'Updated smoke test' },
  }), 200, 'project update')

  const opportunity = expect(await request(baseUrl, '/api/v1/opportunities', {
    token: company.token, method: 'POST', body: {
      title: 'PostgreSQL Migration Internship', type: 'Internship', location: 'Remote', mode: 'Remote',
      skills: ['PostgreSQL', 'Node.js'], deadline: '2027-12-31', openings: 2,
      description: 'A temporary opportunity used to verify the PostgreSQL migration.', status: 'Active',
    },
  }), 201, 'opportunity create').opportunity
  created.opportunities.push(opportunity.id)
  expect(await request(baseUrl, '/api/v1/opportunities/mine', { token: company.token }), 200, 'opportunity mine')
  expect(await request(baseUrl, `/api/v1/opportunities/${opportunity.id}/save`, { token: student.token, method: 'POST' }), 201, 'save opportunity')
  const application = expect(await request(baseUrl, '/api/v1/applications', {
    token: student.token, method: 'POST', body: { opportunityId: opportunity.id, coverLetter: 'PostgreSQL migration verification application.' },
  }), 201, 'application create').application
  expect(await request(baseUrl, '/api/v1/applications/applicants', { token: company.token }), 200, 'applicant list')
  expect(await request(baseUrl, `/api/v1/applications/${application.id}/status`, {
    token: company.token, method: 'PATCH', body: { status: 'Under Review', note: 'Smoke test transition' },
  }), 200, 'application status')
  expect(await request(baseUrl, '/api/v1/notifications', { token: student.token }), 200, 'notifications')

  const workshop = expect(await request(baseUrl, '/api/v1/workshops', {
    token: faculty.token, method: 'POST', body: {
      name: 'PostgreSQL Migration Workshop', skill: 'PostgreSQL', instructor: 'Migration Faculty',
      startDate: '2027-12-20', capacity: 10, mode: 'Online', status: 'Open',
    },
  }), 201, 'workshop create').workshop
  created.workshops.push(workshop.id)
  expect(await request(baseUrl, `/api/v1/workshops/${workshop.id}/enroll`, { token: student.token, method: 'POST' }), 201, 'workshop enroll')
  expect(await request(baseUrl, '/api/v1/workshops/enrollments/mine', { token: student.token }), 200, 'enrollment list')

  const conversation = expect(await request(baseUrl, '/api/v1/conversations', {
    token: student.token, method: 'POST', body: { participantIds: [company.id], title: 'Migration test' },
  }), 201, 'conversation create').conversation
  created.conversations.push(conversation.id)
  expect(await request(baseUrl, `/api/v1/conversations/${conversation.id}/messages`, {
    token: student.token, method: 'POST', body: { text: 'PostgreSQL messaging works.' },
  }), 201, 'message send')
  expect(await request(baseUrl, `/api/v1/conversations/${conversation.id}/messages`, { token: company.token }), 200, 'message list')

  const institution = expect(await request(baseUrl, '/api/v1/institutions', {
    token: admin.token, method: 'POST', body: { name: 'Migration Institute', code: `MIG${Date.now()}`, type: 'Institute' },
  }), 201, 'institution create').institution
  created.institutions.push(institution.id)
  const announcement = expect(await request(baseUrl, '/api/v1/announcements', {
    token: admin.token, method: 'POST', body: { title: 'Migration complete', message: 'PostgreSQL smoke test announcement.', audience: 'everyone', status: 'Published' },
  }), 201, 'announcement create').announcement
  created.announcements.push(announcement.id)
  expect(await request(baseUrl, '/api/v1/announcements/manage', { token: admin.token }), 200, 'announcement manage')

  console.info('PostgreSQL API smoke test passed across all major API domains.')
}

smoke().catch((error) => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => {
  const remove = async (table, ids) => {
    if (ids.length) await query(`DELETE FROM ${table} WHERE id = ANY($1::text[])`, [ids]).catch(() => {})
  }
  await remove('announcements', created.announcements)
  await remove('conversations', created.conversations)
  await remove('workshops', created.workshops)
  await remove('opportunities', created.opportunities)
  await remove('users', created.users)
  await remove('companies', created.companies)
  await remove('institutions', created.institutions)
  if (server) await new Promise((resolve) => server.close(resolve))
  await disconnectDatabase().catch(() => {})
})
