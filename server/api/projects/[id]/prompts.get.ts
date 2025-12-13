import type { Prompt, PromptDifficulty } from '~/types/prompt'
import { requireDatabase } from '~/server/utils/db-helpers'
import { PromptsRepository } from '~/server/repositories/prompts'
import { mapDbPromptToPrompt } from '~/server/utils/mappers'
import { badRequest, internalError } from '~/server/utils/errors'
import { validateDifficulty } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const projectId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const difficulty = query.difficulty as PromptDifficulty | undefined

  if (!projectId) {
    throw badRequest('Missing project ID')
  }

  // Validate difficulty if provided
  if (difficulty) {
    validateDifficulty(difficulty)
  }

  try {
    const promptsRepo = new PromptsRepository(db)
    let dbPrompts
    
    if (difficulty) {
      const prompt = await promptsRepo.findByProjectAndDifficulty(projectId, difficulty)
      dbPrompts = prompt ? [prompt] : []
    } else {
      dbPrompts = await promptsRepo.findByProjectId(projectId)
    }

    const prompts: Prompt[] = dbPrompts.map(mapDbPromptToPrompt)

    return {
      projectId,
      prompts,
      total: prompts.length
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to fetch prompts')
  }
})

