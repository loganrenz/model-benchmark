import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dbPath = join(rootDir, '.data', 'local.db')

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

// Recovered submissions from deleted HTML files
const recoveredSubmissions = [
  {
    projectId: 'offline-queue',
    projectLabel: 'Offline Queue',
    projectFolder: 'offline-queue',
    agentName: 'gpt-5-1-codex-max',
    label: 'GPT-5.1 Codex Max - Offline Queue',
    htmlFile: '/tmp/offline-queue.html'
  },
  {
    projectId: 'realtime-leaderboard',
    projectLabel: 'Realtime Leaderboard',
    projectFolder: 'realtime-leaderboard',
    agentName: 'gpt-5-1-codex-max',
    label: 'GPT-5.1 Codex Max - Realtime Leaderboard',
    htmlFile: '/tmp/realtime-leaderboard.html'
  },
  {
    projectId: 'traffic-stoplight',
    projectLabel: 'Traffic Stoplight',
    projectFolder: 'traffic-stoplight',
    agentName: 'gpt-5-1-codex-max',
    label: 'GPT-5.1 Codex Max - Traffic Stoplight',
    htmlFile: '/tmp/traffic-stoplight.html'
  },
  {
    projectId: 'traffic-simulation',
    projectLabel: 'Traffic Simulation',
    projectFolder: 'traffic-simulation',
    agentName: 'gpt-5-1-codex-max-custom',
    label: 'GPT-5.1 Codex Max - Traffic Simulator (Custom)',
    htmlFile: '/tmp/traffic-simulator-custom.html'
  },
  {
    projectId: 'traffic-simulation',
    projectLabel: 'Traffic Simulation',
    projectFolder: 'traffic-simulation',
    agentName: 'gpt-5-1-codex-max-ref',
    label: 'GPT-5.1 Codex Max - Traffic Simulator (Reference)',
    htmlFile: '/tmp/traffic-simulator-ref.html'
  }
]

console.log('Seeding recovered submissions from deleted HTML files...\n')

let projectsCreated = 0
let submissionsCreated = 0
let skipped = 0

for (const sub of recoveredSubmissions) {
  try {
    // Check if project exists, create if not
    let project = db.prepare('SELECT id FROM projects WHERE id = ?').get(sub.projectId)
    
    if (!project) {
      const now = Math.floor(Date.now() / 1000)
      db.prepare(
        `INSERT INTO projects (id, label, folder, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`
      ).run(sub.projectId, sub.projectLabel, sub.projectFolder, now, now)
      console.log(`✓ Created project: ${sub.projectLabel}`)
      projectsCreated++
    }
    
    // Check if submission already exists
    const existing = db.prepare(
      'SELECT id FROM submissions WHERE project_id = ? AND agent_name = ?'
    ).get(sub.projectId, sub.agentName)
    
    if (existing) {
      console.log(`⏭️  ${sub.projectId}/${sub.agentName}: already exists`)
      skipped++
      continue
    }
    
    // Read HTML file
    const htmlContent = readFileSync(sub.htmlFile, 'utf-8')
    const id = crypto.randomUUID()
    const submittedAt = Math.floor(Date.now() / 1000)
    const filePath = `${sub.agentName}/index.html`
    const thumbnail = generatePlaceholderThumbnail(sub.label)
    
    db.prepare(
      `INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)`
    ).run(id, sub.projectId, sub.agentName, sub.label, filePath, htmlContent, thumbnail, submittedAt)
    
    console.log(`✓ Seeded: ${sub.label}`)
    submissionsCreated++
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️  ${sub.htmlFile}: file not found`)
    } else {
      console.error(`✗ ${sub.projectId}/${sub.agentName}: ${error.message}`)
    }
  }
}

console.log(`\n✅ Created ${projectsCreated} projects, seeded ${submissionsCreated} submissions, skipped ${skipped}`)
db.close()

