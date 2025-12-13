import type { Project, Prompt } from '~/types/prompt'
import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { PromptsRepository } from '~/server/repositories/prompts'
import { mapDbPromptToPrompt } from '~/server/utils/mappers'
import { badRequest, internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const projectId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const includePrompts = query.includePrompts === 'true'
  const includeModels = query.includeModels !== 'false' // Default to true

  if (!projectId) {
    throw badRequest('Missing project ID')
  }

  try {
    const projectsRepo = new ProjectsRepository(db)
    const dbProject = await projectsRepo.findById(projectId)
    const project: Project = {
      id: dbProject.id,
      label: dbProject.label,
      folder: dbProject.folder
    }

    // Fetch prompts if requested
    if (includePrompts) {
      const promptsRepo = new PromptsRepository(db)
      const dbPrompts = await promptsRepo.findByProjectId(projectId)
      project.prompts = dbPrompts.map(mapDbPromptToPrompt)
    }

    // Fetch approved submissions as "models" if requested
    if (includeModels) {
      project.models = await projectsRepo.getModels(projectId)
    }

    return project
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch project')
  }
})

