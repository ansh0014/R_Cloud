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

    const migrationQuery = `
      CREATE TABLE IF NOT EXISTS runtime_registry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deployment_id TEXT NOT NULL,
        runtime_url TEXT,
        railway_project_id TEXT,
        provider TEXT DEFAULT 'railway',
        status TEXT,
        health TEXT,
        restart_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_runtime_deployment_id ON runtime_registry(deployment_id);

      CREATE TABLE IF NOT EXISTS agent_registry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        runtime_id UUID REFERENCES runtime_registry(id) ON DELETE CASCADE,
        name TEXT,
        agent_url TEXT,
        railway_service_id TEXT,
        framework TEXT,
        version TEXT,
        capabilities TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_agent_runtime_id ON agent_registry(runtime_id);
    `
    await client.query(migrationQuery)
    client.release()
  } catch (err) {
    throw new DatabaseError('Failed to connect to PostgreSQL on startup', { originalError: err })
  }
}
