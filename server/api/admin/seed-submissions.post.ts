import { requireDatabase } from '~/server/utils/db-helpers'
import { seedDatabase } from '~/server/database/seed'
import { forbidden, internalError } from '~/server/utils/errors'

/**
 * Seed the database with test submissions
 * This is a development convenience endpoint
 */
export default defineEventHandler(async (event) => {
  // Only allow in development mode
  if (!import.meta.dev) {
    throw forbidden('Seed endpoint only available in development')
  }

  const db = await requireDatabase()

  try {
    const result = await seedDatabase(db)
    return {
      ...result,
      message: `Seeded ${result.submissionsCreated} submissions`
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to seed submissions')
  }
})

