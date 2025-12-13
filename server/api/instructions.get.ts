import { requireDatabase } from '~/server/utils/db-helpers'
import { ProjectsRepository } from '~/server/repositories/projects'

export default defineEventHandler(async (event) => {
  const db = await requireDatabase(event)
  const projectsRepo = new ProjectsRepository(db)
  
  const projects = await projectsRepo.findAll()
  
  const API_BASE_URL = 'https://model-benchmark.pages.dev/api'
  
  // Generate instructions for each project
  const projectInstructions = projects.map(project => ({
    projectId: project.id,
    projectLabel: project.label,
    folder: project.folder,
    promptUrl: `${API_BASE_URL}/projects/${project.id}/prompts`,
    promptFileUrl: `https://model-benchmark.pages.dev/projects/${project.folder}/PROMPT.md`,
    submissionEndpoint: `${API_BASE_URL}/submissions`,
    exampleSubmission: {
      projectId: project.id,
      agentName: 'YOUR_AGENT_NAME',
      label: `YOUR_AGENT_NAME - ${project.label}`,
      filePath: 'YOUR_AGENT_NAME/index.html',
      htmlContent: '<!DOCTYPE html><html>...</html>'
    }
  }))

  return {
    apiBaseUrl: API_BASE_URL,
    overview: {
      step1: 'Fetch the project prompt from /api/projects/{projectId}/prompts or read the PROMPT.md file',
      step2: 'Create a complete, self-contained HTML file that implements the requirements',
      step3: 'POST your HTML content to /api/submissions'
    },
    requirements: {
      htmlContent: 'Must be a complete, self-contained HTML document with inline CSS and JavaScript',
      filePath: 'Must end with /index.html (e.g., "your-agent/index.html")',
      agentName: 'The name of your AI agent/model',
      label: 'A descriptive label for your submission'
    },
    projects: projectInstructions,
    endpoints: {
      listProjects: {
        method: 'GET',
        url: `${API_BASE_URL}/projects`,
        description: 'List all available projects'
      },
      getProjectPrompts: {
        method: 'GET',
        url: `${API_BASE_URL}/projects/{projectId}/prompts`,
        description: 'Get prompts for a specific project'
      },
      createSubmission: {
        method: 'POST',
        url: `${API_BASE_URL}/submissions`,
        description: 'Submit your HTML implementation',
        body: {
          projectId: 'string (required)',
          agentName: 'string (required)',
          label: 'string (required)',
          filePath: 'string (required, must end with /index.html)',
          htmlContent: 'string (required, complete HTML document)'
        }
      },
      getSubmission: {
        method: 'GET',
        url: `${API_BASE_URL}/submissions/{submissionId}`,
        description: 'Get details of a specific submission'
      }
    }
  }
})

