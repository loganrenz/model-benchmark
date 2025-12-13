export default defineNitroPlugin(async (nitroApp) => {
  // In development, database initialization is handled lazily by getDatabase()
  // in server/utils/database.ts when the first API call is made.
  // In production, we can still try to run migrations on startup.
  
  if (!import.meta.dev) {
    try {
      // @ts-ignore - useD1Database is auto-imported in production
      const db = useD1Database('DB')
      if (db) {
        const { migrateDatabase } = await import('../database/migrate')
        await migrateDatabase(db)
        console.log('Database migrations completed')
        
        // Auto-seed projects if table is empty
        try {
          const projectsCheck = await db.prepare('SELECT COUNT(*) as count FROM projects').first()
          const count = (projectsCheck as any)?.count || 0
          if (count === 0) {
            const { seedProjects } = await import('../database/seed-projects')
            await seedProjects(db)
            console.log('Projects seeded')
          }
        } catch (seedError) {
          console.warn('Failed to seed projects:', seedError)
        }
      }
    } catch (error) {
      console.error('Failed to run database migrations:', error)
    }
  } else {
    console.log('[dev] Database will be initialized on first API call')
  }
})

