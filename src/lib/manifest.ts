export interface ManifestModel {
  id: string
  label: string
  path: string
  summary?: string
}

export interface ManifestProject {
  id: string
  title: string
  models: ManifestModel[]
}

export interface Manifest {
  projects: ManifestProject[]
}

export async function loadManifest(): Promise<Manifest> {
  const response = await fetch('/data/manifest.json', {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to load manifest')
  }

  const manifest = (await response.json()) as Manifest
  return manifest
}
