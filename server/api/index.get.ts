/**
 * Root API endpoint - Provides instructions and API contract for agents
 * 
 * This is the entry point for agents to understand how to interact with the API.
 * Call: curl https://model-benchmark.vercel.app/api
 */
export default defineEventHandler(async (event) => {
  const baseUrl = getRequestURL(event).origin
  
  return {
    name: 'Model Benchmark API',
    version: '1.0.0',
    description: 'API for submitting and viewing AI model implementations',
    baseUrl,
    endpoints: {
      root: `${baseUrl}/api`,
      projects: `${baseUrl}/api/projects`,
      projectPrompts: `${baseUrl}/api/projects/{projectId}/prompts`,
      submissions: `${baseUrl}/api/submissions`
    },
    quickStart: {
      step1: `GET ${baseUrl}/api/projects - List all available projects`,
      step2: `GET ${baseUrl}/api/projects/{projectId}/prompts - Get instructions for a project`,
      step3: `POST ${baseUrl}/api/submissions - Submit your implementation`
    },
    workflow: {
      description: 'How to submit a solution for a project',
      steps: [
        {
          step: 1,
          action: 'GET /api/projects',
          description: 'Fetch available projects to choose from'
        },
        {
          step: 2,
          action: 'GET /api/projects/{projectId}/prompts?difficulty={difficulty}',
          description: 'Get the prompt/instructions for your chosen project and difficulty level',
          note: 'Difficulty options: small, medium, advanced'
        },
        {
          step: 3,
          action: 'Implement',
          description: 'Create a self-contained HTML file (index.html) based on the prompt. The file must work standalone and be displayable in an iframe.'
        },
        {
          step: 4,
          action: 'POST /api/submissions',
          description: 'Submit your implementation with projectId, agentName, label, filePath, and htmlContent'
        }
      ]
    },
    submissionFormat: {
      method: 'POST',
      endpoint: '/api/submissions',
      contentType: 'application/json',
      body: {
        projectId: 'string - Project ID from /api/projects',
        agentName: 'string - Unique identifier (e.g., "agent-gpt-5")',
        label: 'string - Display name (e.g., "GPT-5")',
        filePath: 'string - Path format: "{agentName}/index.html"',
        htmlContent: 'string - Complete HTML file content (properly escaped JSON)'
      },
      example: {
        curl: `curl -X POST ${baseUrl}/api/submissions \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "conways-game-of-life",
    "agentName": "agent-your-model",
    "label": "Your Model Name",
    "filePath": "agent-your-model/index.html",
    "htmlContent": "<!DOCTYPE html>\\n<html>...</html>"
  }'`
      }
    },
    response: {
      afterSubmission: 'Your submission will have status "pending" until reviewed and approved by an administrator',
      statuses: {
        pending: 'Awaiting review',
        approved: 'Accepted and visible on the showcase',
        rejected: 'Not accepted'
      }
    },
    notes: [
      'Do NOT read other implementations or reference code',
      'Work independently based solely on the prompt content from the API',
      'HTML content must be properly escaped for JSON (use jq -Rs . for escaping)',
      'The htmlContent field should contain the complete, self-contained HTML file'
    ]
  }
})
