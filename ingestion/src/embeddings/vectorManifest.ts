import fs from 'fs'
import path from 'path'
import { VectorManifest } from './types'
import { MANIFEST_FILE, VECTORS_DIR, CHUNKS_FILE, VECTORS_FILE, EMBEDDING_MODEL } from './config'

export function buildVectorManifest(opts: {
  chunkCount: number
  vectorCount: number
  reusedFromCache: number
  newlyEmbedded: number
  embeddingDimension: number
  status: 'complete' | 'partial'
}): VectorManifest {
  return {
    generated_at: new Date().toISOString(),
    input_file: path.relative(process.cwd(), CHUNKS_FILE),
    output_file: path.relative(process.cwd(), VECTORS_FILE),
    chunk_count: opts.chunkCount,
    vector_count: opts.vectorCount,
    reused_from_cache: opts.reusedFromCache,
    newly_embedded: opts.newlyEmbedded,
    embedding_model: EMBEDDING_MODEL,
    embedding_dimension: opts.embeddingDimension,
    status: opts.status,
  }
}

export function saveVectorManifest(manifest: VectorManifest): void {
  fs.mkdirSync(VECTORS_DIR, { recursive: true })
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
}
