import { describe, it, expect } from 'vitest'
import { mergeSmallSections } from '../src/chunker/mergeSmallSections'
import type { Section } from '../src/chunker/splitMarkdownSections'

// MIN_TOKENS = 150, so a section needs <150 tokens (< 600 chars) to be "small"
// TARGET_TOKENS = 600, so merged must stay <= 600 tokens (<= 2400 chars)

function makeSection(headingPath: string, body: string): Section {
  return { headingPath, headingText: headingPath, body }
}

describe('mergeSmallSections', () => {
  it('merges two tiny sections into one', () => {
    const tiny1 = makeSection('## Section 1', 'Short text.')
    const tiny2 = makeSection('## Section 2', 'Also short.')
    const result = mergeSmallSections([tiny1, tiny2])
    expect(result).toHaveLength(1)
    expect(result[0].body).toContain('Short text.')
    expect(result[0].body).toContain('Also short.')
  })

  it('keeps the first section headingPath when merging', () => {
    const tiny1 = makeSection('## First', 'Short text.')
    const tiny2 = makeSection('## Second', 'Also short.')
    const result = mergeSmallSections([tiny1, tiny2])
    expect(result[0].headingPath).toBe('## First')
  })

  it('does not merge a large section with others', () => {
    // A body of 601+ tokens = 2404+ chars
    const largeBody = 'x'.repeat(2404)
    const large = makeSection('## Large', largeBody)
    const tiny = makeSection('## Tiny', 'Small text.')
    const result = mergeSmallSections([large, tiny])
    // large should stay alone (it's >= MIN_TOKENS), tiny may be separate or merged next
    expect(result.length).toBeGreaterThanOrEqual(1)
    const largeResult = result.find(s => s.headingPath === '## Large')
    expect(largeResult).toBeDefined()
    expect(largeResult?.body).toBe(largeBody)
  })
})
