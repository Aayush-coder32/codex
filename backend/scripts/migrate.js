import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/config/database.js'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const migrationDirectory = path.join(projectRoot, 'sql')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS skillbridge')
    await client.query('SET search_path TO skillbridge, public')
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const files = (await fs.readdir(migrationDirectory)).filter((file) => file.endsWith('.sql')).sort()
    const applied = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((row) => row.name))

    for (const file of files) {
      if (applied.has(file)) continue
      const sql = await fs.readFile(path.join(migrationDirectory, file), 'utf8')
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.info(`Applied migration: ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
    }
    console.info('PostgreSQL migrations are up to date.')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error.message)
  process.exitCode = 1
})
