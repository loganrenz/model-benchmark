export interface Submission {
  id?: string
  projectId: string
  agentName: string
  label: string
  filePath: string
  htmlContent: string
  thumbnail?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt?: string
  reviewedAt?: string
  reviewerNotes?: string
}

export interface SubmissionCreate {
  projectId: string
  agentName: string
  label: string
  filePath: string
  htmlContent: string
}

export interface SubmissionUpdate {
  status?: 'pending' | 'approved' | 'rejected'
  reviewerNotes?: string
}

