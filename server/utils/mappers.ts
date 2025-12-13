import type { Project, Prompt, Model } from '~/types/prompt'
import type { Submission } from '~/types/submission'
import type { DbProject, DbSubmission, DbPrompt } from '~/types/database'

/**
 * Convert database project row to API Project type
 */
export function mapDbProjectToProject(dbProject: DbProject): Project {
  return {
    id: dbProject.id,
    label: dbProject.label,
    folder: dbProject.folder
  }
}

/**
 * Convert database submission row to API Submission type
 */
export function mapDbSubmissionToSubmission(dbSubmission: DbSubmission): Submission {
  return {
    id: dbSubmission.id,
    projectId: dbSubmission.project_id,
    agentName: dbSubmission.agent_name,
    label: dbSubmission.label,
    filePath: dbSubmission.file_path,
    htmlContent: dbSubmission.html_content,
    thumbnail: dbSubmission.thumbnail || undefined,
    status: dbSubmission.status,
    submittedAt: new Date(dbSubmission.submitted_at * 1000).toISOString(),
    reviewedAt: dbSubmission.reviewed_at ? new Date(dbSubmission.reviewed_at * 1000).toISOString() : undefined,
    reviewerNotes: dbSubmission.reviewer_notes || undefined
  }
}

/**
 * Convert database prompt row to API Prompt type
 */
export function mapDbPromptToPrompt(dbPrompt: DbPrompt): Prompt {
  return {
    id: dbPrompt.id,
    projectId: dbPrompt.project_id,
    difficulty: dbPrompt.difficulty,
    title: dbPrompt.title,
    content: dbPrompt.content,
    createdAt: new Date(dbPrompt.created_at * 1000).toISOString(),
    updatedAt: new Date(dbPrompt.updated_at * 1000).toISOString()
  }
}

/**
 * Convert database submission row to Model type (for project models list)
 */
export function mapDbSubmissionToModel(dbSubmission: DbSubmission): Model {
  return {
    id: dbSubmission.agent_name,
    label: dbSubmission.label,
    file: dbSubmission.file_path,
    submissionId: dbSubmission.id,
    thumbnail: dbSubmission.thumbnail || undefined
  }
}

