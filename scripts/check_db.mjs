import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dbPath = join(rootDir, '.data', 'local.db')

const db = new Database(dbPath)

console.log('\n=== Projects ===')
const projects = db.prepare('SELECT * FROM projects').all()
console.log(JSON.stringify(projects, null, 2))

console.log('\n=== Submissions by Project ===')
const submissions = db.prepare(`
  SELECT 
    project_id,
    agent_name,
    label,
    status,
    COUNT(*) as count
  FROM submissions
  GROUP BY project_id, agent_name, label, status
  ORDER BY project_id, agent_name
`).all()
console.log(JSON.stringify(submissions, null, 2))

console.log('\n=== Submission Counts by Status ===')
const statusCounts = db.prepare(`
  SELECT 
    status,
    COUNT(*) as count
  FROM submissions
  GROUP BY status
`).all()
console.log(JSON.stringify(statusCounts, null, 2))

console.log('\n=== Total Submissions ===')
const total = db.prepare('SELECT COUNT(*) as total FROM submissions').get()
console.log(JSON.stringify(total, null, 2))

db.close()

