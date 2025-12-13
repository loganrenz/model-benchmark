import Database from 'better-sqlite3'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const projectsDir = join(rootDir, 'public', 'projects')
const dbPath = join(rootDir, '.data', 'local.db')

const db = new Database(dbPath)

const projectIdMap = {
  'conways-game-of-life': 'conways-game-of-life',
  'particle-gravity': 'particle-gravity',
  'pathfinding-visualizer': 'pathfinding-visualizer',
  'traffic-simulation': 'traffic-simulation',
  'wave-patterns': 'wave-patterns'
}

const projectLabels = {
  'conways-game-of-life': "Conway's Game of Life",
  'particle-gravity': 'Particle Gravity Simulation',
  'pathfinding-visualizer': 'Pathfinding Algorithm Visualizer',
  'traffic-simulation': 'Traffic Simulation',
  'wave-patterns': 'Wave Pattern Generator'
}

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

console.log('Seeding reference submissions from HTML files...\n')

const projectDirs = readdirSync(projectsDir).filter(item => {
  const itemPath = join(projectsDir, item)
  return statSync(itemPath).isDirectory()
})

let seeded = 0
let skipped = 0

for (const projectDir of projectDirs) {
  const projectId = projectIdMap[projectDir]
  if (!projectId) {
    console.warn(`Skipping unknown project: ${projectDir}`)
    continue
  }
  
  const htmlPath = join(projectsDir, projectDir, 'reference', 'index.html')
  
  try {
    // Check if reference submission already exists
    const existing = db.prepare(
      'SELECT id FROM submissions WHERE project_id = ? AND agent_name = ?'
    ).get(projectId, 'reference')
    
    if (existing) {
      console.log(`⏭️  ${projectId}: reference submission already exists`)
      skipped++
      continue
    }
    
    const htmlContent = readFileSync(htmlPath, 'utf-8')
    const label = `${projectLabels[projectId]} - Reference`
    const id = crypto.randomUUID()
    const submittedAt = Math.floor(Date.now() / 1000)
    const filePath = 'reference/index.html'
    const thumbnail = generatePlaceholderThumbnail(label)
    
    db.prepare(
      `INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)`
    ).run(id, projectId, 'reference', label, filePath, htmlContent, thumbnail, submittedAt)
    
    console.log(`✓ ${projectId}: seeded reference submission`)
    seeded++
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️  ${projectId}: HTML file not found at ${htmlPath}`)
    } else {
      console.error(`✗ ${projectId}: ${error.message}`)
    }
  }
}

console.log(`\n✅ Seeded ${seeded} submissions, skipped ${skipped}`)
db.close()

