import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dbPath = join(rootDir, '.data', 'local.db')
const tempDir = '/tmp/recovered-submissions'

// Create temp directory
try {
  mkdirSync(tempDir, { recursive: true })
} catch (e) {
  // Directory already exists
}

const db = new Database(dbPath)

function generatePlaceholderThumbnail(label) {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grad)"/>
      <text x="400" y="300" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
      <text x="400" y="350" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="middle">
        Preview
      </text>
    </svg>
  `
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// All submissions found in git history
const allSubmissions = [
  // Particle Gravity
  { path: 'public/projects/particle-gravity/agent-claude-opus-4/index.html', projectId: 'particle-gravity', agentName: 'agent-claude-opus-4', label: 'Claude Opus 4 - Particle Gravity' },
  { path: 'public/projects/particle-gravity/agent-composer/index.html', projectId: 'particle-gravity', agentName: 'agent-composer', label: 'Agent Composer - Particle Gravity' },
  { path: 'public/projects/particle-gravity/agent-gemini-3-pro-preview/index.html', projectId: 'particle-gravity', agentName: 'agent-gemini-3-pro-preview', label: 'Gemini 3 Pro Preview - Particle Gravity' },
  { path: 'public/projects/particle-gravity/claude-sonnet-45-v1/index.html', projectId: 'particle-gravity', agentName: 'claude-sonnet-45-v1', label: 'Claude Sonnet 4.5 v1 - Particle Gravity' },
  { path: 'public/projects/particle-gravity/claude-sonnet-45-v2/index.html', projectId: 'particle-gravity', agentName: 'claude-sonnet-45-v2', label: 'Claude Sonnet 4.5 v2 - Particle Gravity' },
  
  // Traffic Simulation
  { path: 'public/projects/traffic-simulation/agent-claude-opus-4/index.html', projectId: 'traffic-simulation', agentName: 'agent-claude-opus-4', label: 'Claude Opus 4 - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/agent-claude-sonnet-4.5/index.html', projectId: 'traffic-simulation', agentName: 'agent-claude-sonnet-4.5', label: 'Claude Sonnet 4.5 - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/agent-composer/index.html', projectId: 'traffic-simulation', agentName: 'agent-composer', label: 'Agent Composer - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/agent-gemini-3-pro-preview/index.html', projectId: 'traffic-simulation', agentName: 'agent-gemini-3-pro-preview', label: 'Gemini 3 Pro Preview - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/agent-gpt-5-2/index.html', projectId: 'traffic-simulation', agentName: 'agent-gpt-5-2', label: 'GPT-5.2 - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/agent-gpt-5.2/index.html', projectId: 'traffic-simulation', agentName: 'agent-gpt-5.2', label: 'GPT-5.2 Alt - Traffic Simulation' },
  { path: 'public/projects/traffic-simulation/claude-sonnet-45/index.html', projectId: 'traffic-simulation', agentName: 'claude-sonnet-45', label: 'Claude Sonnet 4.5 - Traffic Simulation' },
  
  // Wave Patterns
  { path: 'public/projects/wave-patterns/agent-claude-opus-4/index.html', projectId: 'wave-patterns', agentName: 'agent-claude-opus-4', label: 'Claude Opus 4 - Wave Patterns' },
  { path: 'public/projects/wave-patterns/agent-composer/index.html', projectId: 'wave-patterns', agentName: 'agent-composer', label: 'Agent Composer - Wave Patterns' },
  { path: 'public/projects/wave-patterns/agent-gemini-3-pro-preview/index.html', projectId: 'wave-patterns', agentName: 'agent-gemini-3-pro-preview', label: 'Gemini 3 Pro Preview - Wave Patterns' },
  { path: 'public/projects/wave-patterns/claude-sonnet-45-v1/index.html', projectId: 'wave-patterns', agentName: 'claude-sonnet-45-v1', label: 'Claude Sonnet 4.5 v1 - Wave Patterns' },
  { path: 'public/projects/wave-patterns/claude-sonnet-45-v2/index.html', projectId: 'wave-patterns', agentName: 'claude-sonnet-45-v2', label: 'Claude Sonnet 4.5 v2 - Wave Patterns' },
]

console.log('Recovering all submissions from git history...\n')

let recovered = 0
let skipped = 0
let errors = 0

for (const sub of allSubmissions) {
  try {
    // Check if submission already exists
    const existing = db.prepare(
      'SELECT id FROM submissions WHERE project_id = ? AND agent_name = ?'
    ).get(sub.projectId, sub.agentName)
    
    if (existing) {
      console.log(`⏭️  ${sub.projectId}/${sub.agentName}: already exists`)
      skipped++
      continue
    }
    
    // Find the last commit where this file existed
    let commit
    try {
      commit = execSync(
        `git log --all --full-history -1 --pretty=format:"%H" -- "${sub.path}"`,
        { cwd: rootDir, encoding: 'utf-8' }
      ).trim()
    } catch (e) {
      console.warn(`⚠️  ${sub.path}: could not find in git history`)
      errors++
      continue
    }
    
    if (!commit) {
      console.warn(`⚠️  ${sub.path}: no commit found`)
      errors++
      continue
    }
    
    // Extract the file from git
    const tempFile = join(tempDir, `${sub.agentName}-${Date.now()}.html`)
    try {
      const htmlContent = execSync(
        `git show ${commit}:"${sub.path}"`,
        { cwd: rootDir, encoding: 'utf-8' }
      )
      writeFileSync(tempFile, htmlContent)
    } catch (e) {
      console.warn(`⚠️  ${sub.path}: could not extract from commit ${commit}`)
      errors++
      continue
    }
    
    // Read the HTML content
    const htmlContent = execSync(
      `git show ${commit}:"${sub.path}"`,
      { cwd: rootDir, encoding: 'utf-8' }
    )
    
    const id = crypto.randomUUID()
    const submittedAt = Math.floor(Date.now() / 1000)
    const filePath = `${sub.agentName}/index.html`
    const thumbnail = generatePlaceholderThumbnail(sub.label)
    
    db.prepare(
      `INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)`
    ).run(id, sub.projectId, sub.agentName, sub.label, filePath, htmlContent, thumbnail, submittedAt)
    
    console.log(`✓ Recovered: ${sub.label}`)
    recovered++
  } catch (error) {
    console.error(`✗ ${sub.projectId}/${sub.agentName}: ${error.message}`)
    errors++
  }
}

console.log(`\n✅ Recovered ${recovered} submissions, skipped ${skipped}, errors ${errors}`)
db.close()

