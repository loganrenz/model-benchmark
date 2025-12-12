import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { taskId } = req.query
  const taskPath = path.join(process.cwd(), 'public', 'tasks', taskId)
  
  try {
    // Check if task directory exists
    if (!fs.existsSync(taskPath)) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Read all model directories in the task folder
    const modelDirs = fs.readdirSync(taskPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    res.status(200).json({
      name: taskId,
      displayName: taskId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      models: modelDirs
    })
  } catch (error) {
    console.error('Error reading task:', error)
    res.status(500).json({ error: 'Failed to read task' })
  }
}
