import type { SubmissionUpdate } from '~/types/submission'
import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { mapDbSubmissionToSubmission } from '~/server/utils/mappers'
import { badRequest, internalError } from '~/server/utils/errors'
import { validateStatus } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<SubmissionUpdate>(event)

  if (!id) {
    throw badRequest('Missing submission ID')
  }

  // Validate status if provided
  if (body.status) {
    validateStatus(body.status)
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    const dbSubmission = await submissionsRepo.update(id, body)
    return mapDbSubmissionToSubmission(dbSubmission)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to update submission')
  }
})

