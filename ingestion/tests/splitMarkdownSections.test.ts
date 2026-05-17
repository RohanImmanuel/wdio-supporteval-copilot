import { describe, it, expect } from 'vitest'
import { splitMarkdownSections } from '../src/chunker/splitMarkdownSections'

describe('splitMarkdownSections', () => {
  it('returns a single section with empty headingPath when there are no headings', () => {
    const content = 'Just some text\nwith no headings.'
    const sections = splitMarkdownSections(content)
    expect(sections).toHaveLength(1)
    expect(sections[0].headingPath).toBe('')
    expect(sections[0].body).toContain('Just some text')
  })

  it('creates sections for H2 then H3 with correct headingPaths', () => {
    const content = `## Overview

Some overview text.

### Details

Some detail text.
`
    const sections = splitMarkdownSections(content)
    // Should have 2 sections: one for ## Overview and one for ### Details
    expect(sections.length).toBeGreaterThanOrEqual(2)

    const overviewSection = sections.find(s => s.headingPath === '## Overview')
    const detailsSection = sections.find(s =>
      s.headingPath === '## Overview | ### Details',
    )

    expect(overviewSection).toBeDefined()
    expect(detailsSection).toBeDefined()
    expect(detailsSection?.body).toContain('Some detail text.')
  })

  it('does not treat headings inside code fences as sections', () => {
    const content = `## Real Heading

\`\`\`
# This is inside a code block
## Not a heading
\`\`\`

Some text.
`
    const sections = splitMarkdownSections(content)
    // Only ## Real Heading should be a section boundary
    const codeHeadingSection = sections.find(s =>
      s.headingPath.includes('This is inside a code block'),
    )
    expect(codeHeadingSection).toBeUndefined()

    const realSection = sections.find(s => s.headingPath === '## Real Heading')
    expect(realSection).toBeDefined()
    expect(realSection?.body).toContain('# This is inside a code block')
  })

  it('strips Docusaurus zero-width-space anchor pattern from heading text', () => {
    // The zero-width space (U+200B) is embedded in the bracket
    const content = '## My Heading [​](#my-heading)\n\nBody text.'
    const sections = splitMarkdownSections(content)
    const section = sections.find(s => s.headingPath.includes('My Heading'))
    expect(section).toBeDefined()
    expect(section?.headingPath).not.toContain('​')
    expect(section?.headingPath).not.toContain('(#my-heading)')
    expect(section?.headingPath).toBe('## My Heading')
  })
})
