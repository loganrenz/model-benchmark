import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { SubmissionsRepository } from '~/server/repositories/submissions'
import { PromptsRepository } from '~/server/repositories/prompts'
import { badRequest, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase()
  const projectId = getRouterParam(event, 'id')

  if (!projectId) {
    throw badRequest('Missing project ID')
  }

  try {
    const projectsRepo = new ProjectsRepository(db)
    const submissionsRepo = new SubmissionsRepository(db)
    const promptsRepo = new PromptsRepository(db)

    // Check if project exists
    await projectsRepo.findById(projectId)

    // Check if there are submissions for this project
    const submissionsResult = await submissionsRepo.findAll({ projectId, limit: 1 })
    if (submissionsResult.total > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot delete project with ${submissionsResult.total} submissions. Delete submissions first.`
      })
    }

    // Delete prompts for this project
    const prompts = await promptsRepo.findByProjectId(projectId)
    for (const prompt of prompts) {
      await promptsRepo.delete(prompt.id)
    }

    // Delete project
    await projectsRepo.delete(projectId)

    return {
      success: true,
      message: 'Project deleted successfully'
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to delete project')
  }
})

