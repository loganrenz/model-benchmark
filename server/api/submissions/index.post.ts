import type { SubmissionCreate } from '~/types/submission'
import { requireDatabase } from '~/server/utils/db-helpers'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { generateThumbnail, generatePlaceholderThumbnail } from '~/server/utils/thumbnail'
import { validateRequired, validateFilePath } from '~/server/utils/validation'
import { badRequest, internalError } from '~/server/utils/errors'
import { mapDbSubmissionToSubmission } from '~/server/utils/mappers'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const body = await readBody<SubmissionCreate>(event)
  const config = useRuntimeConfig(event)

  // Validate required fields
  validateRequired(body, ['projectId', 'agentName', 'label', 'filePath', 'htmlContent'])
  validateFilePath(body.filePath)

  // Generate thumbnail using Screenshotone API if configured
  let thumbnail: string | null
  try {
    thumbnail = await generateThumbnail({
      htmlContent: body.htmlContent,
      label: body.label,
      projectId: body.projectId,
      apiKey: config.screenshotoneApiKey
    }) || generatePlaceholderThumbnail(body.label, body.projectId)
  } catch (error) {
    thumbnail = generatePlaceholderThumbnail(body.label, body.projectId)
  }

  try {
    const submissionsRepo = new SubmissionsRepository(db)
    const dbSubmission = await submissionsRepo.create(body, thumbnail)
    return mapDbSubmissionToSubmission(dbSubmission)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to create submission')
  }
})

