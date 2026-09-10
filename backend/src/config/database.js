import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg
let ready = false

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.databasePoolSize,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  options: '-c search_path=skillbridge,public',
})

pool.on('error', (error) => {
  ready = false
  console.error('PostgreSQL pool error:', error.message)
})

export async function connectDatabase() {
  const client = await pool.connect()
  try {
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
export const query = (text, values = []) => pool.query(text, values)

export async function transaction(work) {
  const client = await pool.connect()
  try {
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
