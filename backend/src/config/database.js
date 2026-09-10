import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg
let ready = false

const databaseUrl = new URL(env.databaseUrl)
if (['prefer', 'require', 'verify-ca'].includes(databaseUrl.searchParams.get('sslmode'))) {
  databaseUrl.searchParams.set('sslmode', 'verify-full')
}

export const pool = new Pool({
  connectionString: databaseUrl.toString(),
  max: env.databasePoolSize,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
})

const configuredClients = new WeakMap()
pool.on('connect', (client) => {
  configuredClients.set(client, client.query('SET search_path TO skillbridge, public'))
})

pool.on('error', (error) => {
  ready = false
  console.error('PostgreSQL pool error:', error.message)
})

export async function connectDatabase() {
  const client = await pool.connect()
  try {
    await configuredClients.get(client)
    const result = await client.query('SELECT current_database() AS database, current_schema() AS schema')
    ready = true
    console.info(`PostgreSQL connected: ${result.rows[0].database} (schema: ${result.rows[0].schema || 'public'})`)
  } finally {
    client.release()
  }
}

export async function disconnectDatabase() {
  ready = false
  await pool.end()
}

export const isDatabaseReady = () => ready
export async function query(text, values = []) {
  const client = await pool.connect()
  try {
    await configuredClients.get(client)
    return await client.query(text, values)
  } finally {
    client.release()
  }
}

export async function transaction(work) {
  const client = await pool.connect()
  try {
    await configuredClients.get(client)
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
