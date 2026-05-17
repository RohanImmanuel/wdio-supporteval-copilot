import { describe, it, expect } from 'vitest'
import { contentHash } from '../src/chunker/contentHash'

describe('contentHash', () => {
  it('returns the same hash for the same input', () => {
    expect(contentHash('hello world')).toBe(contentHash('hello world'))
  })

  it('returns different hashes for different inputs', () => {
    expect(contentHash('hello world')).not.toBe(contentHash('goodbye world'))
  })

  it('result is 64 hex characters', () => {
    const hash = contentHash('test input')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})
