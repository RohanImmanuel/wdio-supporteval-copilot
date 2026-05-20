import { describe, it, expect } from 'vitest'
import { buildEmbeddingInput } from '../src/embeddings/buildEmbeddingInput'
import { Chunk } from '../src/embeddings/types'

function makeChunk(overrides: Partial<Chunk> = {}): Chunk {
  return {
    chunk_id: 'test-chunk-1',
    doc_id: 'test-doc',
    title: 'Browser',
    url: 'https://webdriver.io/docs/api/browser',
    heading_path: '# Browser | ## getGeoLocation',
    content: 'Returns the geo location of the browser.',
    token_count: 10,
    content_hash: 'abc123',
    crawled_at: '2024-01-01T00:00:00Z',
    chunk_index: 0,
    ...overrides,
  }
}

describe('buildEmbeddingInput', () => {
  it('strips leading hashes from heading_path and uses > separator in Section line', () => {
    const chunk = makeChunk({ heading_path: '# Browser | ## getGeoLocation' })
    const result = buildEmbeddingInput(chunk)
    expect(result).toContain('Section: Browser > getGeoLocation')
  })

  it('handles multi-level heading_path correctly', () => {
    const chunk = makeChunk({ heading_path: '# API | ## Element | ### click' })
    const result = buildEmbeddingInput(chunk)
    expect(result).toContain('Section: API > Element > click')
  })

  it('omits Section line when heading_path is empty', () => {
    const chunk = makeChunk({ heading_path: '' })
    const result = buildEmbeddingInput(chunk)
    expect(result).not.toContain('Section:')
  })

  it('omits Section line when heading_path is whitespace only', () => {
    const chunk = makeChunk({ heading_path: '   ' })
    const result = buildEmbeddingInput(chunk)
    expect(result).not.toContain('Section:')
  })

  it('includes title in Title line', () => {
    const chunk = makeChunk({ title: 'My Page Title' })
    const result = buildEmbeddingInput(chunk)
    expect(result).toContain('Title: My Page Title')
  })

  it('includes url in Source line', () => {
    const chunk = makeChunk({ url: 'https://webdriver.io/docs/api/browser' })
    const result = buildEmbeddingInput(chunk)
    expect(result).toContain('Source: https://webdriver.io/docs/api/browser')
  })

  it('includes content verbatim after a blank line', () => {
    const content = 'Returns the geo location of the browser.'
    const chunk = makeChunk({ content })
    const result = buildEmbeddingInput(chunk)
    // There should be a blank line before the content
    expect(result).toContain('\n\n' + content)
  })

  it('content appears at the end of the output', () => {
    const content = 'Some content here.'
    const chunk = makeChunk({ content })
    const result = buildEmbeddingInput(chunk)
    expect(result.endsWith(content)).toBe(true)
  })
})
