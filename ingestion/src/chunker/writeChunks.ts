import fs from 'fs'
import { CHUNKS_DIR, CHUNKS_FILE, MANIFEST_FILE } from './config'
import type { Chunk } from './types'
import type { ChunkManifest } from './types'

export function writeChunks(chunks: Chunk[], manifest: ChunkManifest): void {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true })
  const jsonl = chunks.map(c => JSON.stringify(c)).join('\n') + '\n'
  fs.writeFileSync(CHUNKS_FILE, jsonl, 'utf8')
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
}
