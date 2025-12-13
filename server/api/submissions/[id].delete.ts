import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { badRequest, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw badRequest('Missing submission ID')
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    await submissionsRepo.delete(id)
    return { success: true }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to delete submission')
  }
})

