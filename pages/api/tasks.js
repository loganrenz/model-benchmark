import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const tasksDir = path.join(process.cwd(), 'public', 'tasks')
  
  try {
    // Check if tasks directory exists
    if (!fs.existsSync(tasksDir)) {
      return res.status(200).json([])
    }

    // Read all directories in the tasks folder
    const taskDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => {
        const taskPath = path.join(tasksDir, dirent.name)
        
        // Count models in this task
        const modelDirs = fs.readdirSync(taskPath, { withFileTypes: true })
          .filter(d => d.isDirectory())
        
        return {
          name: dirent.name,
          displayName: dirent.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          modelCount: modelDirs.length,
          models: modelDirs.map(d => d.name)
        }
      })

    res.status(200).json(taskDirs)
  } catch (error) {
    console.error('Error reading tasks:', error)
    res.status(500).json({ error: 'Failed to read tasks' })
  }
}
