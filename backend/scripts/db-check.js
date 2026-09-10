import { pool } from '../src/config/database.js'

async function check() {
  const connection = await pool.query('SELECT current_database() AS database, NOW() AS checked_at')
  const tables = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema = 'skillbridge' AND table_type = 'BASE TABLE'
  `)
  const migrations = await pool.query('SELECT name, run_at FROM schema_migrations ORDER BY name')
  console.info(`PostgreSQL database reachable: ${connection.rows[0].database}`)
  console.info(`SkillBridge tables: ${tables.rows[0].count}`)
  console.info(`Applied migrations: ${migrations.rows.map((row) => row.name).join(', ') || 'none'}`)
  await pool.end()
}

check().catch((error) => {
  console.error('Database check failed:', error.message)
  process.exitCode = 1
})
