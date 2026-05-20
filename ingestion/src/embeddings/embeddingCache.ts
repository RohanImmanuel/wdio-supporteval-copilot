import { Chunk, VectorRecord } from './types'

export function cacheKey(content_hash: string, model: string): string {
  return `${content_hash}::${model}`
}

export function buildCache(vectors: VectorRecord[]): Map<string, VectorRecord> {
  const cache = new Map<string, VectorRecord>()
  for (const record of vectors) {
    cache.set(cacheKey(record.content_hash, record.embedding_model), record)
  }
  return cache
}

export function getCached(
  cache: Map<string, VectorRecord>,
  chunk: Chunk,
  model: string
): VectorRecord | undefined {
  return cache.get(cacheKey(chunk.content_hash, model))
}
