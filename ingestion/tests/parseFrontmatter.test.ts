import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from '../src/chunker/parseFrontmatter'

describe('parseFrontmatter', () => {
  const sampleMd = `---
title: My Page
url: https://webdriver.io/docs/api/browser
crawled_at: "2024-01-15T10:00:00.000Z"
---

This is the body content.
`

  it('parses title from frontmatter', () => {
    const result = parseFrontmatter(sampleMd)
    expect(result.title).toBe('My Page')
  })

  it('parses url from frontmatter', () => {
    const result = parseFrontmatter(sampleMd)
    expect(result.url).toBe('https://webdriver.io/docs/api/browser')
  })

  it('parses crawled_at from frontmatter', () => {
    const result = parseFrontmatter(sampleMd)
    expect(result.crawled_at).toBe('2024-01-15T10:00:00.000Z')
  })

  it('returns body content without frontmatter', () => {
    const result = parseFrontmatter(sampleMd)
    expect(result.content).toContain('This is the body content.')
    expect(result.content).not.toContain('title:')
  })

  it('converts Date object to ISO string', () => {
    const date = new Date('2024-06-01T12:00:00Z')
    const mdWithDate = `---
title: Test
url: https://webdriver.io/docs/test
crawled_at: ${date.toISOString()}
---
body
`
    const result = parseFrontmatter(mdWithDate)
    expect(typeof result.crawled_at).toBe('string')
    expect(result.crawled_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
