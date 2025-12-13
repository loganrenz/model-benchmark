import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { mapDbSubmissionToSubmission } from '~/server/utils/mappers'
import { badRequest, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw badRequest('Missing submission ID')
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    const dbSubmission = await submissionsRepo.findById(id)
    return mapDbSubmissionToSubmission(dbSubmission)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch submission')
  }
})

