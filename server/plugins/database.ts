// Track if we've initialized the database during this instance
let dbInitialized = false

export default defineNitroPlugin(async (nitroApp) => {
  // On Cloudflare Pages, D1 binding is only available within request context,
  // so we can't run migrations at startup. Instead, we'll run them on first request.
  // 
  // The actual initialization happens in the request hook below.
  
  if (import.meta.dev) {
    console.log('[dev] Database will be initialized on first API call')
    return
  }
  
  // Add a request hook to run migrations on first request in production
  nitroApp.hooks.hook('request', async (event) => {
    if (dbInitialized) return
    
    try {
      // Access D1 from the request context
      const cf = (event.context as any).cloudflare
      const db = cf?.env?.DB
      
      if (!db) {
        console.warn('D1 binding not found in request context')
        return
      }
      
      dbInitialized = true
      
      const { migrateDatabase } = await import('../database/migrate')
      await migrateDatabase(db)
      console.log('Database migrations completed')
      
      // Auto-seed projects if table is empty
      try {
        const projectsCheck = await db.prepare('SELECT COUNT(*) as count FROM projects').first()
        const count = (projectsCheck as any)?.count || 0
        if (count === 0) {
          const { seedDatabase } = await import('../database/seed')
          await seedDatabase(db)
          console.log('Database seeded with projects and submissions')
        }
      } catch (seedError) {
        console.warn('Failed to seed database:', seedError)
      }
    } catch (error) {
      console.error('Failed to run database migrations:', error)
    }
  })
})

