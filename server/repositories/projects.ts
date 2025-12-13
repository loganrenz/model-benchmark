import type { Database } from '@cloudflare/d1'
import type { Project, Model } from '~/types/prompt'
import type { DbProject } from '~/types/database'
import { mapDbProjectToProject, mapDbSubmissionToModel } from '~/server/utils/mappers'
import { getOrThrow } from '~/server/utils/db-helpers'
import { notFound } from '~/server/utils/errors'

export class ProjectsRepository {
  constructor(private db: Database) {}

  /**
   * Get all projects
   */
  async findAll(): Promise<DbProject[]> {
    const result = await this.db.prepare('SELECT * FROM projects ORDER BY label').all<DbProject>()
    return (result.results || []) as DbProject[]
  }

  /**
   * Get a project by ID
   */
  async findById(id: string): Promise<DbProject> {
    return getOrThrow<DbProject>(
      this.db,
      'SELECT * FROM projects WHERE id = ?',
      [id],
      'Project not found'
    )
  }

  /**
   * Check if project exists
   */
  async exists(id: string): Promise<boolean> {
    const result = await this.db.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first()
    return !!result
  }

  /**
   * Create a new project
   */
  async create(id: string, label: string, folder: string): Promise<DbProject> {
    const now = Math.floor(Date.now() / 1000)
    await this.db.prepare(
      'INSERT INTO projects (id, label, folder, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, label, folder, now, now)
      .run()

    return this.findById(id)
  }

  /**
   * Update a project
   */
  async update(id: string, label: string, folder: string): Promise<DbProject> {
    const now = Math.floor(Date.now() / 1000)
    await this.db.prepare(
      'UPDATE projects SET label = ?, folder = ?, updated_at = ? WHERE id = ?'
    )
      .bind(label, folder, now, id)
      .run()

    return this.findById(id)
  }

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    const result = await this.db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run()
    if (!result.success) {
      throw notFound('Project not found')
    }
  }

  /**
   * Get approved submissions as models for a project
   */
  async getModels(projectId: string): Promise<Model[]> {
    const result = await this.db.prepare(
      "SELECT * FROM submissions WHERE status = 'approved' AND project_id = ? ORDER BY submitted_at DESC"
    ).bind(projectId).all()

    if (!result.results || result.results.length === 0) {
      return []
    }

    return result.results.map(mapDbSubmissionToModel)
  }

  /**
   * Get all projects with their models (approved submissions)
   */
  async findAllWithModels(): Promise<Project[]> {
    const projects = await this.findAll()
    const projectsMap = new Map<string, Project>()

    // Initialize projects
    for (const dbProject of projects) {
      const project = mapDbProjectToProject(dbProject)
      project.models = []
      projectsMap.set(project.id, project)
    }

    // Fetch all approved submissions
    const submissionsResult = await this.db.prepare(
      "SELECT * FROM submissions WHERE status = 'approved' ORDER BY project_id, submitted_at DESC"
    ).all()

    if (submissionsResult.results && submissionsResult.results.length > 0) {
      for (const row of submissionsResult.results) {
        const dbSubmission = row as any
        const project = projectsMap.get(dbSubmission.project_id)
        if (project) {
          project.models!.push(mapDbSubmissionToModel(dbSubmission))
        }
      }
    }

    return Array.from(projectsMap.values())
  }
}

