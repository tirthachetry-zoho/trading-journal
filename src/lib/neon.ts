import { Pool } from '@neondatabase/serverless'
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// For direct queries
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
