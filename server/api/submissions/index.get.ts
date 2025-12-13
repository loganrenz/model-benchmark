import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const query = getQuery(event)
  
  const projectId = query.projectId as string | undefined
  const status = query.status as 'pending' | 'approved' | 'rejected' | undefined
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    const result = await submissionsRepo.findAll({
      projectId,
      status,
      limit,
      offset
    })

    return result
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch submissions')
  }
})

