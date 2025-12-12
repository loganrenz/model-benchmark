export type Manifest = {
  version: number
  root: 'projects'
  projects: Array<{
    id: string
    label: string
    folder: string
    models: Array<{
      id: string
      label: string
      file: string
    }>
  }>
}

export type ModelRef = {
  projectId: string
  modelId: string
}

