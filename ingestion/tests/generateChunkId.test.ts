import { describe, it, expect } from 'vitest'
import { slugify, generateChunkId } from '../src/chunker/generateChunkId'

describe('slugify', () => {
  it('converts heading path to slug', () => {
    const result = slugify('## Overview | ### Details')
    // Non-alphanumeric chars stripped, spaces to dashes, multiple dashes collapsed
    expect(result).toMatch(/^[a-z0-9-]+$/)
    expect(result).toContain('overview')
    expect(result).toContain('details')
  })
})

describe('generateChunkId', () => {
  it('produces correct chunk id with padded index', () => {
    expect(generateChunkId('api-browser', '## Overview', 3)).toBe(
      'api-browser-overview-0003',
    )
  })

  it('uses "content" slug for empty heading path', () => {
    expect(generateChunkId('api-browser', '', 0)).toBe('api-browser-content-0000')
  })
})
