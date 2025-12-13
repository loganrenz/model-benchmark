import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { validateRequired, validateProjectId } from '~/server/utils/validation'
import { badRequest, internalError } from '~/server/utils/errors'
import { mapDbProjectToProject } from '~/server/utils/mappers'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase()
  const body = await readBody(event)
  const { id, label, folder } = body

  validateRequired(body, ['id', 'label', 'folder'])
  validateProjectId(id)

  try {
    const projectsRepo = new ProjectsRepository(db)
    
    // Check if project already exists
    if (await projectsRepo.exists(id)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Project with this ID already exists'
      })
    }

    const dbProject = await projectsRepo.create(id, label, folder)
    const project = mapDbProjectToProject(dbProject)

    return {
      success: true,
      project
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to create project')
  }
})

