export interface Manifest {
  version: number
  root: string
  projects: Project[]
}

export interface Project {
  id: string
  label: string
  folder: string
  models: Model[]
}

export interface Model {
  id: string
  label: string
  file: string
}
