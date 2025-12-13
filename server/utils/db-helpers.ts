import type { Database } from '@cloudflare/d1'
import { getDatabase } from './database'

/**
 * Require database connection - throws error if database is not available
 */
export async function requireDatabase(): Promise<Database> {
  const db = await getDatabase()
  if (!db) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database not available'
    })
  }
  return db
}

/**
 * Get a value from database or throw 404 if not found
 */
export async function getOrThrow<T>(
  db: Database,
  sql: string,
  params: unknown[],
  errorMessage: string = 'Resource not found'
): Promise<T> {
  const result = await db.prepare(sql).bind(...params).first<T>()
  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: errorMessage
    })
  }
  return result
}

