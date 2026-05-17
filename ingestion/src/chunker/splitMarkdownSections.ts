export interface Section {
  headingPath: string
  headingText: string
  body: string
}

// Matches Docusaurus zero-width-space anchor pattern: [​](#anchor)
// U+200B is the zero-width space character
const ZWS_ANCHOR_RE = /\[​\]\(#[^)]+\)/g

export function splitMarkdownSections(content: string): Section[] {
  const lines = content.split('\n')
  const sections: Section[] = []

  // heading stack: [h1, h2, h3]
  const stack: [string, string, string] = ['', '', '']
  let currentHeadingText = ''
  let currentBodyLines: string[] = []
  let inCodeBlock = false
  let hasHeadings = false

  function flushSection() {
    const nonEmptyParts = stack.filter(s => s !== '')
    const headingPath = nonEmptyParts.join(' | ')
    const body = currentBodyLines.join('\n').trim()
    sections.push({
      headingPath,
      headingText: currentHeadingText,
      body,
    })
  }

  for (const line of lines) {
    // Toggle code block on ``` or ~~~
    if (/^```|^~~~/.test(line)) {
      inCodeBlock = !inCodeBlock
      currentBodyLines.push(line)
      continue
    }

    // Check for heading (only when not in code block)
    if (!inCodeBlock) {
      const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
      if (headingMatch) {
        // Flush previous section
        flushSection()

        hasHeadings = true
        const level = headingMatch[1].length
        // Strip zero-width space anchor pattern
        const rawText = headingMatch[2].replace(ZWS_ANCHOR_RE, '').trim()
        const headingWithHashes = `${'#'.repeat(level)} ${rawText}`

        // Update stack: clear deeper levels when shallower heading appears
        if (level === 1) {
          stack[0] = headingWithHashes
          stack[1] = ''
          stack[2] = ''
        } else if (level === 2) {
          stack[1] = headingWithHashes
          stack[2] = ''
        } else {
          // level === 3
          stack[2] = headingWithHashes
        }

        currentHeadingText = rawText
        currentBodyLines = []
        continue
      }
    }

    currentBodyLines.push(line)
  }

  // Flush last section
  flushSection()

  if (!hasHeadings) {
    // No headings found — return single section with all content
    const body = lines.join('\n').trim()
    return [{ headingPath: '', headingText: '', body }]
  }

  // Filter out completely empty sections (no heading path and no body)
  return sections.filter(s => s.headingPath !== '' || s.body !== '')
}
