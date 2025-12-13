/**
 * Get HTML content for an approved submission
 * Used to serve the actual HTML file for display in iframes
 */
import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { badRequest, forbidden, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw badRequest('Missing submission ID')
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    const dbSubmission = await submissionsRepo.findById(id)

    // Only allow viewing approved submissions
    if (dbSubmission.status !== 'approved') {
      throw forbidden('Submission not approved')
    }

    // Return HTML content with proper headers
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
    return dbSubmission.html_content
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch submission content')
  }
})
