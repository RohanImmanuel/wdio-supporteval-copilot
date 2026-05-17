import type { Chunk } from './types'
import type { ChunkManifest } from './types'
import { CHUNKS_FILE, MANIFEST_FILE } from './config'
import path from 'path'

export function buildChunkManifest(chunks: Chunk[]): ChunkManifest {
  const tokens = chunks.map(c => c.token_count)
  return {
    generated_at: new Date().toISOString(),
    total_chunks: chunks.length,
    total_docs: new Set(chunks.map(c => c.doc_id)).size,
    chunks_file: path.relative(path.dirname(MANIFEST_FILE), CHUNKS_FILE),
    stats: {
      min_tokens: Math.min(...tokens),
      max_tokens: Math.max(...tokens),
      avg_tokens: Math.round(tokens.reduce((a, b) => a + b, 0) / tokens.length),
    },
  }
}
