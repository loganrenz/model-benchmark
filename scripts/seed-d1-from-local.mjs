import Database from 'better-sqlite3'
import { execSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, unlinkSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const dbPath = join(rootDir, '.data', 'local.db')

const db = new Database(dbPath)

console.log('Seeding D1 database from local database...\n')

// Get all projects
const projects = db.prepare('SELECT * FROM projects').all()
console.log(`Found ${projects.length} projects`)

// Get all submissions
const submissions = db.prepare('SELECT * FROM submissions').all()
console.log(`Found ${submissions.length} submissions\n`)

// Create SQL file for D1 import
const sqlStatements = []

// Add projects
for (const project of projects) {
  const values = [
    `'${project.id.replace(/'/g, "''")}'`,
    `'${project.label.replace(/'/g, "''")}'`,
    `'${project.folder.replace(/'/g, "''")}'`,
    project.created_at,
    project.updated_at
  ].join(', ')
  
  sqlStatements.push(
    `INSERT OR REPLACE INTO projects (id, label, folder, created_at, updated_at) VALUES (${values});`
  )
}

// Add submissions
for (const submission of submissions) {
  // Escape single quotes in strings
  const escapeSql = (str) => str ? str.replace(/'/g, "''") : ''
  
  const values = [
    `'${submission.id}'`,
    `'${escapeSql(submission.project_id)}'`,
    `'${escapeSql(submission.agent_name)}'`,
    `'${escapeSql(submission.label)}'`,
    `'${escapeSql(submission.file_path)}'`,
    `'${escapeSql(submission.html_content)}'`,
    submission.thumbnail ? `'${escapeSql(submission.thumbnail)}'` : 'NULL',
    `'${escapeSql(submission.status)}'`,
    submission.submitted_at,
    submission.reviewed_at || 'NULL',
    submission.review_notes ? `'${escapeSql(submission.review_notes)}'` : 'NULL'
  ].join(', ')
  
  sqlStatements.push(
    `INSERT OR REPLACE INTO submissions (id, project_id, agent_name, label, file_path, html_content, thumbnail, status, submitted_at, reviewed_at, review_notes) VALUES (${values});`
  )
}

// Write SQL to temp file
const sqlFile = '/tmp/seed-d1.sql'
writeFileSync(sqlFile, sqlStatements.join('\n'))

console.log(`Generated SQL file with ${sqlStatements.length} statements`)
console.log(`SQL file saved to: ${sqlFile}`)
console.log('\nTo seed the D1 database, run:')
console.log(`  wrangler d1 execute model-benchmark-db --remote --file=${sqlFile}`)
console.log('\nOr for local D1:')
console.log(`  wrangler d1 execute model-benchmark-db --local --file=${sqlFile}`)

db.close()

