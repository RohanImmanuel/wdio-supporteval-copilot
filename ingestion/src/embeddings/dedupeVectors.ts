import fs from 'fs'
import { VectorRecord } from './types'
import { readExistingVectors } from './readExistingVectors'

function recordKey(record: VectorRecord): string {
  return `${record.chunk_id}::${record.content_hash}::${record.embedding_model}`
}

export function dedupe(records: VectorRecord[]): VectorRecord[] {
  const seen = new Map<string, VectorRecord>()
  for (const record of records) {
    seen.set(recordKey(record), record)
  }
  return Array.from(seen.values())
}

export function dedupeVectors(filePath: string): { total: number; kept: number } {
  const records = readExistingVectors(filePath)
  const total = records.length
  const deduped = dedupe(records)
  const kept = deduped.length

  const content = deduped.map((r) => JSON.stringify(r)).join('\n') + (deduped.length > 0 ? '\n' : '')
  fs.writeFileSync(filePath, content, 'utf-8')

  return { total, kept }
}
