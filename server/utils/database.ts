import type { Database as D1Database } from '@cloudflare/d1'
import { join, dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'

// D1-compatible interface for local SQLite database
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(column?: string): Promise<T | null>
  run(): Promise<{ success: boolean; meta: unknown }>
  all<T = unknown>(): Promise<{ results: T[]; success: boolean }>
}

interface D1Result {
  results: unknown[]
  success: boolean
}

// Local SQLite singleton
let localDb: any = null

async function getLocalDb(): Promise<any> {
  if (!localDb) {
    // Dynamic import better-sqlite3
    const { default: Database } = await import('better-sqlite3')
    const dbPath = join(process.cwd(), '.data', 'local.db')
    
    // Ensure .data directory exists
    const dataDir = dirname(dbPath)
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    
    localDb = new Database(dbPath)
    console.log('[dev] Using local SQLite database at', dbPath)
  }
  return localDb
}

// Create a D1-compatible wrapper around better-sqlite3
function createD1Wrapper(sqliteDb: any): D1Database {
  return {
    prepare(sql: string): D1PreparedStatement {
      let boundValues: unknown[] = []
      
      const stmt: D1PreparedStatement = {
        bind(...values: unknown[]): D1PreparedStatement {
          boundValues = values
          return stmt
        },
        async first<T = unknown>(column?: string): Promise<T | null> {
          try {
            const prepared = sqliteDb.prepare(sql)
            const row = prepared.get(...boundValues) as Record<string, unknown> | undefined
            if (!row) return null
            if (column) return row[column] as T
            return row as T
          } catch (e) {
            console.error('[dev] DB first() error:', e)
            return null
          }
        },
        async run(): Promise<{ success: boolean; meta: unknown }> {
          try {
            const prepared = sqliteDb.prepare(sql)
            const result = prepared.run(...boundValues)
            return { success: true, meta: result }
          } catch (e) {
            console.error('[dev] DB run() error:', e)
            return { success: false, meta: {} }
          }
        },
        async all<T = unknown>(): Promise<{ results: T[]; success: boolean }> {
          try {
            const prepared = sqliteDb.prepare(sql)
            const results = prepared.all(...boundValues) as T[]
            return { results, success: true }
          } catch (e) {
            console.error('[dev] DB all() error:', e)
            return { results: [], success: false }
          }
        }
      }
      return stmt
    },
    async exec(sql: string): Promise<D1Result> {
      try {
        sqliteDb.exec(sql)
        return { results: [], success: true }
      } catch (e) {
        // Don't log duplicate column errors - they're expected during migrations
        if (e instanceof Error && 
            !e.message.toLowerCase().includes('duplicate column') &&
            !e.message.toLowerCase().includes('already exists')) {
          console.error('[dev] DB exec() error:', e)
        }
        throw e
      }
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result[]> {
      const results: D1Result[] = []
      for (const stmt of statements) {
        const result = await stmt.all()
        results.push({ results: result.results as unknown[], success: result.success })
      }
      return results
    },
    async dump(): Promise<ArrayBuffer> {
      throw new Error('dump() not supported in development mode')
    }
  } as D1Database
}

// Track if database has been initialized
let dbInitialized = false

/**
 * Get database instance - works in both dev (SQLite) and production (D1)
 */
export async function getDatabase(): Promise<D1Database | null> {
  // In production, use D1
  if (!import.meta.dev) {
    // useD1Database is auto-imported by Nitro in production
    try {
      // @ts-ignore - useD1Database is auto-imported in production
      return useD1Database('DB')
    } catch (e) {
      console.error('Failed to get D1 database:', e)
      return null
    }
  }
  
  // In development, use local SQLite with D1-compatible wrapper
  try {
    const sqliteDb = await getLocalDb()
    const db = createD1Wrapper(sqliteDb)
    
    // Initialize database on first access
    if (!dbInitialized) {
      dbInitialized = true
      console.log('[dev] Initializing local database...')
      
      // Run migrations
      const { migrateDatabase } = await import('../database/migrate')
      await migrateDatabase(db)
      console.log('[dev] Migrations completed')
    }
    
    return db
  } catch (e) {
    console.error('[dev] Failed to create local database:', e)
    return null
  }
}

