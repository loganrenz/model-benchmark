export type PromptDifficulty = 'small' | 'medium' | 'advanced'

export interface Prompt {
  id: string
  projectId: string
  difficulty: PromptDifficulty
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  label: string
  folder: string
  prompts?: Prompt[]
  models?: Model[]
}

export interface Model {
  id: string
  label: string
  file: string
  submissionId?: string
  thumbnail?: string
}

