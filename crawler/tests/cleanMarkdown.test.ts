import { describe, it, expect } from 'vitest'
import { cleanMarkdown } from '../src/cleanMarkdown'

describe('cleanMarkdown', () => {
  it('collapses multiple blank lines into one', () => {
    const input = 'Paragraph one\n\n\n\nParagraph two'
    expect(cleanMarkdown(input)).toBe('Paragraph one\n\nParagraph two')
  })

  it('strips trailing whitespace from lines', () => {
    const input = 'line one   \nline two\t'
    expect(cleanMarkdown(input)).toBe('line one\nline two')
  })

  it('trims leading and trailing whitespace from the whole string', () => {
    const input = '\n\nsome content\n\n'
    expect(cleanMarkdown(input)).toBe('some content')
  })

  it('returns an empty string unchanged', () => {
    expect(cleanMarkdown('')).toBe('')
  })

  it('preserves intentional single blank lines', () => {
    const input = 'Paragraph one\n\nParagraph two'
    expect(cleanMarkdown(input)).toBe('Paragraph one\n\nParagraph two')
  })
})
