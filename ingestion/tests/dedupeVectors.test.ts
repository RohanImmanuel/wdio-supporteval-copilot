import { describe, it, expect } from 'vitest'
import { dedupe } from '../src/embeddings/dedupeVectors'
import { VectorRecord } from '../src/embeddings/types'

function makeRecord(overrides: Partial<VectorRecord> = {}): VectorRecord {
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

describe('dedupe', () => {
  it('keeps last occurrence when two records have same chunk_id+hash+model', () => {
    const r1 = makeRecord({ embedding: [1, 2, 3] })
    const r2 = makeRecord({ embedding: [4, 5, 6] })
    const result = dedupe([r1, r2])
    expect(result).toHaveLength(1)
    expect(result[0].embedding).toEqual([4, 5, 6])
  })

  it('keeps both records when they have different chunk_id', () => {
    const r1 = makeRecord({ chunk_id: 'chunk-1' })
    const r2 = makeRecord({ chunk_id: 'chunk-2' })
    const result = dedupe([r1, r2])
    expect(result).toHaveLength(2)
  })

  it('keeps both records when same chunk_id but different content_hash (updated content)', () => {
    const r1 = makeRecord({ chunk_id: 'chunk-1', content_hash: 'hash-old' })
    const r2 = makeRecord({ chunk_id: 'chunk-1', content_hash: 'hash-new' })
    const result = dedupe([r1, r2])
    expect(result).toHaveLength(2)
  })

  it('keeps both records when same chunk_id+hash but different model', () => {
    const r1 = makeRecord({ embedding_model: 'gemini-embedding-001' })
    const r2 = makeRecord({ embedding_model: 'other-model' })
    const result = dedupe([r1, r2])
    expect(result).toHaveLength(2)
  })

  it('returns empty array for empty input', () => {
    expect(dedupe([])).toEqual([])
  })

  it('returns single record unchanged', () => {
    const r1 = makeRecord()
    const result = dedupe([r1])
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(r1)
  })
})
