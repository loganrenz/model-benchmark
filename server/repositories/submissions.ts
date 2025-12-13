import type { Database } from '@cloudflare/d1'
import type { Submission, SubmissionCreate, SubmissionUpdate } from '~/types/submission'
import type { DbSubmission, DbCountResult } from '~/types/database'
import { mapDbSubmissionToSubmission } from '~/server/utils/mappers'
import { getOrThrow } from '~/server/utils/db-helpers'
import { notFound } from '~/server/utils/errors'

export interface SubmissionFilters {
  projectId?: string
  status?: 'pending' | 'approved' | 'rejected'
  limit?: number
  offset?: number
}

export interface SubmissionListResult {
  submissions: Submission[]
  total: number
  limit: number
  offset: number
}

export class SubmissionsRepository {
  constructor(private db: Database) {}

  /**
   * Get all submissions with optional filters
   */
  async findAll(filters: SubmissionFilters = {}): Promise<SubmissionListResult> {
    const limit = filters.limit || 50
    const offset = filters.offset || 0

    let sql = 'SELECT * FROM submissions WHERE 1=1'
    const params: unknown[] = []

    if (filters.projectId) {
      sql += ' AND project_id = ?'
      params.push(filters.projectId)
    }

    if (filters.status) {
      sql += ' AND status = ?'
      params.push(filters.status)
    }

    sql += ' ORDER BY submitted_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await this.db.prepare(sql).bind(...params).all<DbSubmission>()
    const submissions = (result.results || []).map(mapDbSubmissionToSubmission)

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM submissions WHERE 1=1'
    const countParams: unknown[] = []

    if (filters.projectId) {
      countSql += ' AND project_id = ?'
      countParams.push(filters.projectId)
    }

    if (filters.status) {
      countSql += ' AND status = ?'
      countParams.push(filters.status)
    }

    const countResult = await this.db.prepare(countSql).bind(...countParams).first<DbCountResult>()
    const total = countResult?.total || 0

    return {
      submissions,
      total,
      limit,
      offset
    }
  }

  /**
   * Get a submission by ID
   */
  async findById(id: string): Promise<DbSubmission> {
    return getOrThrow<DbSubmission>(
      this.db,
      'SELECT * FROM submissions WHERE id = ?',
      [id],
      'Submission not found'
    )
  }

  /**
   * Get submission content (for serving HTML)
   */
  async getContent(id: string): Promise<string> {
    const submission = await this.findById(id)
    return submission.html_content
  }

  /**
   * Create a new submission
   */
  async create(data: SubmissionCreate, thumbnail: string | null): Promise<DbSubmission> {
    const id = crypto.randomUUID()
    const submittedAt = Math.floor(Date.now() / 1000)

    await this.db.prepare(
      `INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
    )
      .bind(
        id,
        data.projectId,
        data.agentName,
        data.label,
        data.filePath,
        data.htmlContent,
        thumbnail,
        submittedAt
      )
      .run()

    return this.findById(id)
  }

  /**
   * Update a submission
   */
  async update(id: string, data: SubmissionUpdate): Promise<DbSubmission> {
    const updates: string[] = []
    const params: unknown[] = []

    if (data.status !== undefined) {
      updates.push('status = ?')
      params.push(data.status)

      // If status is being changed from pending, set reviewed_at
      if (data.status !== 'pending') {
        updates.push('reviewed_at = ?')
        params.push(Math.floor(Date.now() / 1000))
      }
    }

    if (data.reviewerNotes !== undefined) {
      updates.push('reviewer_notes = ?')
      params.push(data.reviewerNotes)
    }

    if (updates.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No fields to update'
      })
    }

    params.push(id)

    const sql = `UPDATE submissions SET ${updates.join(', ')} WHERE id = ?`
    await this.db.prepare(sql).bind(...params).run()

    return this.findById(id)
  }

  /**
   * Update submission thumbnail
   */
  async updateThumbnail(id: string, thumbnail: string): Promise<void> {
    await this.db.prepare('UPDATE submissions SET thumbnail = ? WHERE id = ?')
      .bind(thumbnail, id)
      .run()
  }

  /**
   * Delete a submission
   */
  async delete(id: string): Promise<void> {
    const result = await this.db.prepare('DELETE FROM submissions WHERE id = ?').bind(id).run()
    if (!result.success) {
      throw notFound('Submission not found')
    }
  }

  /**
   * Get all submissions for thumbnail backfill (those without thumbnails)
   */
  async findAllWithoutThumbnails(): Promise<DbSubmission[]> {
    const result = await this.db.prepare(
      "SELECT * FROM submissions WHERE thumbnail IS NULL OR thumbnail = ''"
    ).all<DbSubmission>()

    return (result.results || []) as DbSubmission[]
  }
}

