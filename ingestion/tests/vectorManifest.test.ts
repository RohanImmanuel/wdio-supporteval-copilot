import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildVectorManifest } from '../src/embeddings/vectorManifest'

describe('buildVectorManifest', () => {
  it('produces correct fields', () => {
    const manifest = buildVectorManifest({
      chunkCount: 2333,
      vectorCount: 2333,
      reusedFromCache: 86,
      newlyEmbedded: 2247,
      embeddingDimension: 768,
      status: 'complete',
    })

    expect(manifest.chunk_count).toBe(2333)
    expect(manifest.vector_count).toBe(2333)
    expect(manifest.reused_from_cache).toBe(86)
    expect(manifest.newly_embedded).toBe(2247)
    expect(manifest.embedding_dimension).toBe(768)
    expect(manifest.status).toBe('complete')
    expect(manifest.embedding_model).toBe('gemini-embedding-001')
    expect(typeof manifest.generated_at).toBe('string')
    expect(typeof manifest.input_file).toBe('string')
    expect(typeof manifest.output_file).toBe('string')
  })

  it('newly_embedded + reused_from_cache === vector_count', () => {
    const manifest = buildVectorManifest({
      chunkCount: 100,
      vectorCount: 100,
      reusedFromCache: 30,
      newlyEmbedded: 70,
      embeddingDimension: 768,
      status: 'complete',
    })

    expect(manifest.newly_embedded + manifest.reused_from_cache).toBe(manifest.vector_count)
  })

  it('supports partial status', () => {
    const manifest = buildVectorManifest({
      chunkCount: 2333,
      vectorCount: 500,
      reusedFromCache: 0,
      newlyEmbedded: 500,
      embeddingDimension: 768,
      status: 'partial',
    })

    expect(manifest.status).toBe('partial')
  })

  it('generated_at is a valid ISO date string', () => {
    const manifest = buildVectorManifest({
      chunkCount: 10,
      vectorCount: 10,
      reusedFromCache: 0,
      newlyEmbedded: 10,
      embeddingDimension: 768,
      status: 'complete',
    })

    const date = new Date(manifest.generated_at)
    expect(date.toString()).not.toBe('Invalid Date')
  })
})
