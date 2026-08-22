require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const result = await pool.query(`UPDATE "User" SET role = 'admin'`)
  console.log('Updated', result.rowCount, 'users to admin role')
  await pool.end()
}

main().catch(console.error)
