import fs from 'fs'
import { VectorRecord } from './types'

export function readExistingVectors(filePath: string): VectorRecord[] {
  if (!fs.existsSync(filePath)) {
    return []
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  const records: VectorRecord[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    try {
      const parsed = JSON.parse(lines[i]) as VectorRecord
      if (!parsed.chunk_id || !parsed.content_hash || !parsed.embedding_model) {
        console.warn(`Warning: vectors line ${lineNum} missing required fields, skipping`)
        continue
      }
      records.push(parsed)
    } catch {
      console.warn(`Warning: vectors line ${lineNum} is not valid JSON, skipping`)
    }
  }

  return records
}
