import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'
import { internalError } from '~/server/utils/errors'

/**
 * Initialize database with default projects
 * This is a convenience endpoint for first-time setup
 */
export default defineEventHandler(async (event) => {
  const db = await requireDatabase()

  const defaultProjects = [
    {
      id: 'traffic-simulation',
      label: 'Traffic Simulation',
      folder: 'traffic-simulation'
    },
    {
      id: 'particle-gravity',
      label: 'Particle Gravity Simulation',
      folder: 'particle-gravity'
    },
    {
      id: 'wave-patterns',
      label: 'Wave Pattern Generator',
      folder: 'wave-patterns'
    },
    {
      id: 'conways-game-of-life',
      label: "Conway's Game of Life",
      folder: 'conways-game-of-life'
    },
    {
      id: 'pathfinding-visualizer',
      label: 'Pathfinding Algorithm Visualizer',
      folder: 'pathfinding-visualizer'
    }
  ]

  const projectsRepo = new ProjectsRepository(db)
  const results = []
  
  for (const project of defaultProjects) {
    try {
      // Check if project already exists
      if (await projectsRepo.exists(project.id)) {
        results.push({
          id: project.id,
          status: 'skipped',
          message: 'Already exists'
        })
        continue
      }

      // Create new project
      await projectsRepo.create(project.id, project.label, project.folder)

      results.push({
        id: project.id,
        status: 'created',
        message: 'Successfully created'
      })
    } catch (error) {
      results.push({
        id: project.id,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create'
      })
    }
  }

  return {
    success: true,
    results
  }
})

