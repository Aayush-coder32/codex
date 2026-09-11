import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { app } from '../src/app.js'
import { registerSchema } from '../src/validation/schemas.js'

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve))
})

test('liveness endpoint responds without a database connection', async () => {
  const response = await fetch(`${baseUrl}/health/live`)
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.data.status, 'ok')
})

test('protected endpoints reject requests without an access token', async () => {
  const response = await fetch(`${baseUrl}/api/v1/students/me`)
  const body = await response.json()
  assert.equal(response.status, 401)
  assert.equal(body.error.code, 'AUTH_REQUIRED')
  assert.ok(body.error.requestId)
})

test('administrator signup payload passes registration validation', () => {
  const result = registerSchema.safeParse({
    body: { name: 'Admin', email: 'admin@gmail.com', password: 'password', role: 'admin' },
    params: {},
    query: {},
  })
  assert.equal(result.success, true)
})

test('unknown endpoints return the standard error envelope', async () => {
  const response = await fetch(`${baseUrl}/api/v1/not-a-route`)
  const body = await response.json()
  assert.equal(response.status, 404)
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND')
})
