import { describe, it, expect } from 'vitest'
import { countTokens } from '../src/chunker/tokenCounter'

describe('countTokens', () => {
  it('returns 0 for empty string', () => {
    expect(countTokens('')).toBe(0)
  })

  it('returns 1 for 4-char string', () => {
    expect(countTokens('abcd')).toBe(1)
  })

  it('returns 2 for 8-char string', () => {
    expect(countTokens('abcdefgh')).toBe(2)
  })

  it('returns 2 for 5-char string (ceiling)', () => {
    expect(countTokens('abcde')).toBe(2)
  })
})
