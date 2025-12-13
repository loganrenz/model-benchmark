import type { Database } from '@cloudflare/d1'

const SCHEMA = `
-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  folder TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  label TEXT NOT NULL,
  file_path TEXT NOT NULL,
  html_content TEXT NOT NULL,
  thumbnail TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
  reviewed_at INTEGER,
  reviewer_notes TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('small', 'medium', 'advanced')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(project_id, difficulty),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_project_id ON prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_prompts_difficulty ON prompts(difficulty);
`

export async function migrateDatabase(db: Database) {
  // Split by semicolons and execute each statement
  const statements = SCHEMA
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0)
  
  for (const statement of statements) {
    try {
      await db.exec(statement)
    } catch (error) {
      // Ignore "already exists" errors
      if (error instanceof Error && !error.message.includes('already exists')) {
        console.error('Migration error:', error)
        throw error
      }
    }
  }

  // Add thumbnail column to existing submissions table if it doesn't exist
  try {
    await db.exec('ALTER TABLE submissions ADD COLUMN thumbnail TEXT')
  } catch (error) {
    // Silently ignore "duplicate column" errors - column already exists
    if (error instanceof Error && 
        !error.message.toLowerCase().includes('duplicate column') && 
        !error.message.toLowerCase().includes('already exists')) {
      console.error('Migration error adding thumbnail column:', error)
      throw error
    }
    // Column already exists, which is fine
  }
}

