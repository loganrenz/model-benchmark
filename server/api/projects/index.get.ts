import type { Project, Prompt } from '~/types/prompt'
import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { PromptsRepository } from '~/server/repositories/prompts'
import { mapDbPromptToPrompt } from '~/server/utils/mappers'
import { internalError } from '~/server/utils/errors'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase()
  const query = getQuery(event)
  const includePrompts = query.includePrompts === 'true'
  const includeModels = query.includeModels !== 'false' // Default to true

  try {
    const projectsRepo = new ProjectsRepository(db)
    
    // Get projects with models if requested
    const projects = includeModels 
      ? await projectsRepo.findAllWithModels()
      : (await projectsRepo.findAll()).map(p => ({
          id: p.id,
          label: p.label,
          folder: p.folder,
          models: []
        }))

    // Fetch prompts if requested
    if (includePrompts) {
      const promptsRepo = new PromptsRepository(db)
      const promptsByProject = await promptsRepo.findAllGroupedByProject()

      for (const project of projects) {
        project.prompts = promptsByProject.get(project.id) || []
      }
    }

    return {
      projects,
      total: projects.length
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch projects')
  }
})

