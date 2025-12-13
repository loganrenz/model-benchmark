import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const projectsDir = join(rootDir, 'public', 'projects')
const seedFile = join(rootDir, 'server', 'database', 'seed.ts')

// Map project folder names to project IDs
const projectIdMap = {
  'conways-game-of-life': 'conways-game-of-life',
  'particle-gravity': 'particle-gravity',
  'pathfinding-visualizer': 'pathfinding-visualizer',
  'traffic-simulation': 'traffic-simulation',
  'wave-patterns': 'wave-patterns'
}

// Map project IDs to labels
const projectLabels = {
  'conways-game-of-life': "Conway's Game of Life",
  'particle-gravity': 'Particle Gravity Simulation',
  'pathfinding-visualizer': 'Pathfinding Algorithm Visualizer',
  'traffic-simulation': 'Traffic Simulation',
  'wave-patterns': 'Wave Pattern Generator'
}

function escapeTemplateLiteral(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${')
}

function readHTMLFile(filePath) {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message)
    return null
  }
}

function buildSeedData() {
  const seedData = {}
  
  // Read all project directories
  const projectDirs = readdirSync(projectsDir).filter(item => {
    const itemPath = join(projectsDir, item)
    return statSync(itemPath).isDirectory()
  })
  
  for (const projectDir of projectDirs) {
    const projectId = projectIdMap[projectDir]
    if (!projectId) {
      console.warn(`Skipping unknown project directory: ${projectDir}`)
      continue
    }
    
    const htmlPath = join(projectsDir, projectDir, 'reference', 'index.html')
    
    try {
      const htmlContent = readHTMLFile(htmlPath)
      if (!htmlContent) {
        console.warn(`No HTML file found for ${projectId} at ${htmlPath}`)
        continue
      }
      
      if (!seedData[projectId]) {
        seedData[projectId] = []
      }
      
      // Use "reference" as the agent name for reference implementations
      const label = `${projectLabels[projectId]} - Reference`
      
      seedData[projectId].push({
        agentName: 'reference',
        label,
        htmlContent: escapeTemplateLiteral(htmlContent)
      })
      
      console.log(`✓ Added seed data for ${projectId}`)
    } catch (error) {
      console.error(`Error processing ${projectId}:`, error.message)
    }
  }
  
  return seedData
}

function generateSeedFile(seedData) {
  const entries = Object.entries(seedData)
  
  let seedContent = `import type { Database } from '@cloudflare/d1'

/**
 * Seed the database with test projects and sample submissions
 * This is idempotent - can be run multiple times safely
 * Auto-generated from HTML files in public/projects
 */
export async function seedDatabase(db: Database) {
  // Sample HTML submissions for each project
  const sampleSubmissions: Record<string, Array<{ agentName: string; label: string; htmlContent: string }>> = {
`
  
  for (const [projectId, submissions] of entries) {
    seedContent += `    '${projectId}': [\n`
    
    for (const submission of submissions) {
      seedContent += `      {\n`
      seedContent += `        agentName: '${submission.agentName}',\n`
      seedContent += `        label: '${submission.label.replace(/'/g, "\\'")}',\n`
      seedContent += `        htmlContent: \`${submission.htmlContent}\`\n`
      seedContent += `      },\n`
    }
    
    seedContent += `    ],\n`
  }
  
  seedContent += `  }

  try {
    // Get all existing projects
    const projectsResult = await db.prepare('SELECT id FROM projects').all()
    const existingProjectIds = new Set(
      (projectsResult.results as any[]).map(p => p.id)
    )

    // Get all existing submissions to avoid duplicates
    const submissionsResult = await db.prepare('SELECT project_id, agent_name FROM submissions').all()
    const existingSubmissions = new Set(
      (submissionsResult.results as any[]).map(s => \`\${s.project_id}:\${s.agent_name}\`)
    )

    let projectsCreated = 0
    let submissionsCreated = 0

    // Seed submissions for each project
    for (const [projectId, submissions] of Object.entries(sampleSubmissions)) {
      if (!existingProjectIds.has(projectId)) {
        console.log(\`[seed] Project \${projectId} not found, skipping submissions\`)
        continue
      }

      for (const submission of submissions) {
        const submissionKey = \`\${projectId}:\${submission.agentName}\`
        if (existingSubmissions.has(submissionKey)) {
          console.log(\`[seed] Submission \${submissionKey} already exists, skipping\`)
          continue
        }

        const id = crypto.randomUUID()
        const submittedAt = Math.floor(Date.now() / 1000)
        const filePath = \`\${submission.agentName}/index.html\`

        // Generate a simple placeholder thumbnail (will be replaced by actual generation)
        const thumbnail = generatePlaceholderThumbnail(submission.label)

        try {
          await db.prepare(
            \`INSERT INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', ?)\`
          )
            .bind(id, projectId, submission.agentName, submission.label, filePath, submission.htmlContent, thumbnail, submittedAt)
            .run()

          submissionsCreated++
          console.log(\`[seed] Created submission: \${submission.label} for \${projectId}\`)
        } catch (error) {
          console.error(\`[seed] Error creating submission \${submissionKey}:\`, error)
        }
      }
    }

    return {
      success: true,
      projectsCreated,
      submissionsCreated
    }
  } catch (error) {
    console.error('[seed] Error seeding database:', error)
    throw error
  }
}

/**
 * Generate a simple placeholder thumbnail
 */
function generatePlaceholderThumbnail(label: string): string {
  const svg = \`
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grad)"/>
      <text x="400" y="300" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">
        \${escapeXml(label)}
      </text>
      <text x="400" y="350" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="middle">
        Preview
      </text>
    </svg>
  \`
  
  // Use btoa for base64 encoding (works in both Node and browser environments)
  const base64 = typeof Buffer !== 'undefined' 
    ? Buffer.from(svg).toString('base64')
    : btoa(unescape(encodeURIComponent(svg)))
  return \`data:image/svg+xml;base64,\${base64}\`
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
`
  
  writeFileSync(seedFile, seedContent, 'utf-8')
  console.log(`\n✓ Generated seed file: ${seedFile}`)
}

// Main execution
console.log('Building seed file from HTML files...\n')
const seedData = buildSeedData()
console.log(`\nFound ${Object.keys(seedData).length} projects with HTML files`)
generateSeedFile(seedData)
console.log('\n✓ Done!')

