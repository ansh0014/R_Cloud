import pg from 'pg'
import { config } from '../config/config.js'
import { DatabaseError } from '../errors/database.error.js'

const { Pool } = pg

export const db = new Pool({
  connectionString: config.DATABASE_URL,
})

db.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err)
  process.exit(-1)
})

export async function connectDatabase(): Promise<void> {
  try {
    const client = await db.connect()
    console.log('Connected to PostgreSQL (Supabase)')
    client.release()
  } catch (err) {
    throw new DatabaseError('Failed to connect to PostgreSQL on startup', { originalError: err })
  }
}
