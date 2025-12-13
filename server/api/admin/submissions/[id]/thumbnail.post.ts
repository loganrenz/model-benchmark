import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { generateThumbnail, generatePlaceholderThumbnail } from '~/server/utils/thumbnail'
import { badRequest, notFound, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const config = useRuntimeConfig(event)
  const submissionId = getRouterParam(event, 'id')

  if (!submissionId) {
    throw badRequest('Missing submission ID')
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    
    // Get the submission
    const submission = await submissionsRepo.findById(submissionId)
    
    if (!submission) {
      throw notFound('Submission not found')
    }

    // Generate thumbnail from HTML content
    const thumbnail = await generateThumbnail({
      htmlContent: submission.htmlContent || '',
      label: submission.label,
      projectId: submission.projectId,
      apiKey: config.screenshotoneApiKey
    }) || generatePlaceholderThumbnail(submission.label, submission.projectId)

    // Update the submission with the thumbnail
    await submissionsRepo.updateThumbnail(submissionId, thumbnail)

    return {
      success: true,
      submissionId,
      thumbnail
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to generate thumbnail')
  }
})

