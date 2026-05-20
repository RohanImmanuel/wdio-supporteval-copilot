import { describe, it, expect } from 'vitest'
import { buildCache, cacheKey, getCached } from '../src/embeddings/embeddingCache'
import { Chunk, VectorRecord } from '../src/embeddings/types'

function makeVectorRecord(overrides: Partial<VectorRecord> = {}): VectorRecord {
  return {
    chunk_id: 'chunk-1',
    doc_id: 'doc-1',
    title: 'Browser',
    url: 'https://webdriver.io/docs/browser',
    heading_path: '# Browser',
    content: 'Some content.',
    token_count: 5,
    content_hash: 'hash-abc',
    crawled_at: '2024-01-01T00:00:00Z',
    chunk_index: 0,
    embedding_model: 'gemini-embedding-001',
    embedding: [0.1, 0.2, 0.3],
    metadata: { source: 'webdriverio' },
    ...overrides,
  }
}

function makeChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    chunk_id: 'chunk-1',
    doc_id: 'doc-1',
    title: 'Browser',
    url: 'https://webdriver.io/docs/browser',
    heading_path: '# Browser',
    content: 'Some content.',
    token_count: 5,
    content_hash: 'hash-abc',
    crawled_at: '2024-01-01T00:00:00Z',
    chunk_index: 0,
    ...overrides,
  }
}

describe('embeddingCache', () => {
  describe('cacheKey', () => {
    it('produces a key combining content_hash and model', () => {
      expect(cacheKey('hash-abc', 'gemini-embedding-001')).toBe(
        'hash-abc::gemini-embedding-001'
      )
    })
  })

  describe('buildCache', () => {
    it('builds a map with the correct keys', () => {
      const record = makeVectorRecord()
      const cache = buildCache([record])
      expect(cache.size).toBe(1)
      expect(cache.has('hash-abc::gemini-embedding-001')).toBe(true)
    })

    it('last record wins for duplicate keys', () => {
      const r1 = makeVectorRecord({ embedding: [1, 2, 3] })
      const r2 = makeVectorRecord({ embedding: [4, 5, 6] })
      const cache = buildCache([r1, r2])
      expect(cache.get('hash-abc::gemini-embedding-001')?.embedding).toEqual([4, 5, 6])
    })
  })

  describe('getCached', () => {
    it('returns record when content_hash and model match', () => {
      const record = makeVectorRecord()
      const cache = buildCache([record])
      const chunk = makeChunk({ content_hash: 'hash-abc' })
      const result = getCached(cache, chunk, 'gemini-embedding-001')
      expect(result).toEqual(record)
    })

    it('returns undefined when content_hash differs', () => {
      const record = makeVectorRecord({ content_hash: 'hash-abc' })
      const cache = buildCache([record])
      const chunk = makeChunk({ content_hash: 'hash-different' })
      const result = getCached(cache, chunk, 'gemini-embedding-001')
      expect(result).toBeUndefined()
    })

    it('returns undefined when model differs', () => {
      const record = makeVectorRecord({ embedding_model: 'gemini-embedding-001' })
      const cache = buildCache([record])
      const chunk = makeChunk({ content_hash: 'hash-abc' })
      const result = getCached(cache, chunk, 'some-other-model')
      expect(result).toBeUndefined()
    })
  })
})
