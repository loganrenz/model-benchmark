import type { Database } from '@cloudflare/d1'
import type { Prompt, PromptDifficulty } from '~/types/prompt'
import type { DbPrompt } from '~/types/database'
import { mapDbPromptToPrompt } from '~/server/utils/mappers'
import { getOrThrow } from '~/server/utils/db-helpers'

export interface PromptCreate {
  projectId: string
  difficulty: PromptDifficulty
  title: string
  content: string
}

export class PromptsRepository {
  constructor(private db: Database) {}

  /**
   * Get all prompts for a project
   */
  async findByProjectId(projectId: string): Promise<DbPrompt[]> {
    const result = await this.db.prepare(
      'SELECT * FROM prompts WHERE project_id = ? ORDER BY CASE difficulty WHEN "small" THEN 1 WHEN "medium" THEN 2 WHEN "advanced" THEN 3 END'
    ).bind(projectId).all<DbPrompt>()

    return (result.results || []) as DbPrompt[]
  }

  /**
   * Get a prompt by project ID and difficulty
   */
  async findByProjectAndDifficulty(projectId: string, difficulty: PromptDifficulty): Promise<DbPrompt | null> {
    const result = await this.db.prepare(
      'SELECT * FROM prompts WHERE project_id = ? AND difficulty = ?'
    ).bind(projectId, difficulty).first<DbPrompt>()

    return result || null
  }

  /**
   * Create or update a prompt (upsert)
   */
  async upsert(data: PromptCreate): Promise<DbPrompt> {
    const existing = await this.findByProjectAndDifficulty(data.projectId, data.difficulty)
    const now = Math.floor(Date.now() / 1000)

    if (existing) {
      // Update existing
      await this.db.prepare(
        `UPDATE prompts 
         SET title = ?, content = ?, updated_at = ? 
         WHERE project_id = ? AND difficulty = ?`
      )
        .bind(data.title, data.content, now, data.projectId, data.difficulty)
        .run()

      return this.findByProjectAndDifficulty(data.projectId, data.difficulty) as Promise<DbPrompt>
    } else {
      // Insert new
      const id = crypto.randomUUID()
      await this.db.prepare(
        `INSERT INTO prompts (id, project_id, difficulty, title, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(id, data.projectId, data.difficulty, data.title, data.content, now, now)
        .run()

      return getOrThrow<DbPrompt>(
        this.db,
        'SELECT * FROM prompts WHERE id = ?',
        [id],
        'Failed to create prompt'
      )
    }
  }

  /**
   * Delete a prompt
   */
  async delete(id: string): Promise<void> {
    await this.db.prepare('DELETE FROM prompts WHERE id = ?').bind(id).run()
  }

  /**
   * Get all prompts grouped by project
   */
  async findAllGroupedByProject(): Promise<Map<string, Prompt[]>> {
    const result = await this.db.prepare(
      "SELECT * FROM prompts ORDER BY project_id, CASE difficulty WHEN 'small' THEN 1 WHEN 'medium' THEN 2 WHEN 'advanced' THEN 3 END"
    ).all<DbPrompt>()

    const promptsByProject = new Map<string, Prompt[]>()

    if (result.results) {
      for (const dbPrompt of result.results) {
        const prompt = mapDbPromptToPrompt(dbPrompt as DbPrompt)
        if (!promptsByProject.has(prompt.projectId)) {
          promptsByProject.set(prompt.projectId, [])
        }
        promptsByProject.get(prompt.projectId)!.push(prompt)
      }
    }

    return promptsByProject
  }
}

