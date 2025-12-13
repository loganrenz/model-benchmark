import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { generateThumbnail, generatePlaceholderThumbnail } from '~/server/utils/thumbnail'
import { internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase()
  const query = getQuery(event)
  const regenerate = query.regenerate === 'true'

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    
    // Get submissions - either all (if regenerating) or only those without thumbnails
    let submissions: Array<{ id: string; html_content: string; label: string; project_id: string }>
    
    if (regenerate) {
      // Get all submissions for regeneration
      const result = await submissionsRepo.findAll({ limit: 10000 })
      submissions = result.submissions
        .filter(s => s.id) // Filter out any without IDs (shouldn't happen, but be safe)
        .map(s => ({
          id: s.id!,
          html_content: s.htmlContent,
          label: s.label,
          project_id: s.projectId
        }))
    } else {
      // Get only submissions without thumbnails
      const dbSubmissions = await submissionsRepo.findAllWithoutThumbnails()
      submissions = dbSubmissions.map(s => ({
        id: s.id,
        html_content: s.html_content,
        label: s.label,
        project_id: s.project_id
      }))
    }

    if (submissions.length === 0) {
      return {
        success: true,
        processed: 0,
        succeeded: 0,
        failed: 0,
        message: 'No submissions need thumbnails'
      }
    }

    let succeeded = 0
    let failed = 0
    const errors: string[] = []

    // Process each submission
    for (const submission of submissions) {
      try {
        // Generate thumbnail from HTML content stored in database
        const thumbnail = await generateThumbnail(
          submission.html_content || '', 
          submission.label, 
          submission.project_id
        ) || generatePlaceholderThumbnail(submission.label, submission.project_id)

        // Update the submission with the thumbnail
        await submissionsRepo.updateThumbnail(submission.id, thumbnail)
        succeeded++
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Submission ${submission.id}: ${errorMessage}`)
      }
    }

    return {
      success: true,
      processed: submissions.length,
      succeeded,
      failed,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to backfill thumbnails')
  }
})

