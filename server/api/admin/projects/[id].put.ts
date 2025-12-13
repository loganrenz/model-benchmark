import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { validateRequired } from '~/server/utils/validation'
import { badRequest, internalError } from '~/server/utils/errors'
import { mapDbProjectToProject } from '~/server/utils/mappers'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase()
  const projectId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { label, folder } = body

  if (!projectId) {
    throw badRequest('Missing project ID')
  }

  validateRequired(body, ['label', 'folder'])

  try {
    const projectsRepo = new ProjectsRepository(db)
    const dbProject = await projectsRepo.update(projectId, label, folder)
    const project = mapDbProjectToProject(dbProject)

    return {
      success: true,
      project
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to update project')
  }
})

