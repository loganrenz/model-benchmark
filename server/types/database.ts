/**
 * Database row types matching the SQL schema
 * These represent the exact structure of rows returned from the database
 */

export interface DbProject {
  id: string
  label: string
  folder: string
  created_at: number
  updated_at: number
}

export interface DbSubmission {
  id: string
  project_id: string
  agent_name: string
  label: string
  file_path: string
  html_content: string
  thumbnail: string | null
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: number
  reviewed_at: number | null
  reviewer_notes: string | null
}

export interface DbPrompt {
  id: string
  project_id: string
  difficulty: 'small' | 'medium' | 'advanced'
  title: string
  content: string
  created_at: number
  updated_at: number
}

/**
 * Database result types for queries that return counts
 */
export interface DbCountResult {
  total: number
}

