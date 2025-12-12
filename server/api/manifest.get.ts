import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async () => {
  const filePath = join(process.cwd(), 'public', 'data', 'manifest.json')
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw)
})

