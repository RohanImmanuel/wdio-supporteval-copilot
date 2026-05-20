import fs from 'fs'
import { Chunk } from './types'

const REQUIRED_FIELDS: (keyof Chunk)[] = [
  'chunk_id',
  'doc_id',
  'title',
  'url',
  'heading_path',
  'content',
  'token_count',
  'content_hash',
]

function isValidChunk(obj: unknown): obj is Chunk {
  if (typeof obj !== 'object' || obj === null) return false
  const record = obj as Record<string, unknown>
  return REQUIRED_FIELDS.every((field) => field in record && record[field] !== undefined)
}

export function readChunks(filePath: string): Chunk[] {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  const chunks: Chunk[] = []

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1
    try {
      const parsed = JSON.parse(lines[i])
      if (!isValidChunk(parsed)) {
        console.warn(`Warning: line ${lineNum} missing required fields, skipping`)
        continue
      }
      chunks.push(parsed)
    } catch {
      console.warn(`Warning: line ${lineNum} is not valid JSON, skipping`)
    }
  }

  return chunks
}
