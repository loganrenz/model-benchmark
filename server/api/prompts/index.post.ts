import type { PromptDifficulty } from '~/types/prompt'
import { requireDatabase } from '~/server/utils/db-helpers'
import { PromptsRepository } from '~/server/repositories/prompts'
import { mapDbPromptToPrompt } from '~/server/utils/mappers'
import { validateRequired, validateDifficulty } from '~/server/utils/validation'
import { internalError } from '~/server/utils/errors'

interface PromptCreate {
  projectId: string
  difficulty: PromptDifficulty
  title: string
  content: string
}

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const body = await readBody<PromptCreate>(event)

  // Validate required fields
  validateRequired(body as unknown as Record<string, unknown>, ['projectId', 'difficulty', 'title', 'content'])
  validateDifficulty(body.difficulty)

  try {
    const promptsRepo = new PromptsRepository(db)
    const dbPrompt = await promptsRepo.upsert(body)
    return mapDbPromptToPrompt(dbPrompt)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw internalError('Failed to save prompt')
  }
})


