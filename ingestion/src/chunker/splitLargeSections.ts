import type { Section } from './splitMarkdownSections'
import { countTokens } from './tokenCounter'
import { TARGET_TOKENS, MAX_TOKENS, OVERLAP_TOKENS } from './config'

function getOverlapText(body: string): string {
  if (!body) return ''
  const paragraphs = body.split('\n\n')
  const overlapParagraphs: string[] = []
  let tokens = 0

  // Take paragraphs from the end until we reach OVERLAP_TOKENS.
  // Skip any paragraph that would individually exceed OVERLAP_TOKENS — including one
  // such paragraph as overlap could push the next chunk far over MAX_TOKENS.
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i]
    const pTokens = countTokens(p)
    if (tokens + pTokens > OVERLAP_TOKENS) break
    overlapParagraphs.unshift(p)
    tokens += pTokens
    if (tokens >= OVERLAP_TOKENS) break
  }

  return overlapParagraphs.join('\n\n')
}

function splitByChars(text: string, headingPath: string, headingText: string): Section[] {
  const chunkSize = TARGET_TOKENS * 4
  const result: Section[] = []
  let offset = 0
  while (offset < text.length) {
    let end = offset + chunkSize
    if (end < text.length) {
      const spaceAt = text.lastIndexOf(' ', end)
      if (spaceAt > offset) end = spaceAt
    } else {
      end = text.length
    }
    result.push({ headingPath, headingText, body: text.slice(offset, end) })
    offset = end + 1
  }
  return result
}

function splitByLines(paragraph: string, headingPath: string, headingText: string): Section[] {
  const lines = paragraph.split('\n')
  const result: Section[] = []
  let lineBuffer: string[] = []
  let lineTokens = 0

  for (const line of lines) {
    const lt = countTokens(line)
    if (lt > MAX_TOKENS) {
      if (lineBuffer.length > 0) {
        result.push({ headingPath, headingText, body: lineBuffer.join('\n') })
        lineBuffer = []
        lineTokens = 0
      }
      for (const charChunk of splitByChars(line, headingPath, headingText)) {
        result.push(charChunk)
      }
      continue
    }
    if (lineTokens + lt > TARGET_TOKENS && lineBuffer.length > 0) {
      result.push({ headingPath, headingText, body: lineBuffer.join('\n') })
      lineBuffer = []
      lineTokens = 0
    }
    lineBuffer.push(line)
    lineTokens += lt
  }

  if (lineBuffer.length > 0) {
    result.push({ headingPath, headingText, body: lineBuffer.join('\n') })
  }
  return result
}

export function splitLargeSection(section: Section, prevChunkBody?: string): Section[] {
  const paragraphs = section.body.split('\n\n')
  const totalTokens = countTokens(section.body)

  if (totalTokens <= MAX_TOKENS) {
    return [section]
  }

  const subChunks: Section[] = []
  let currentParagraphs: string[] = []
  let currentTokens = 0

  for (const paragraph of paragraphs) {
    const pTokens = countTokens(paragraph)

    // Single paragraph exceeds MAX_TOKENS — split by lines in TARGET_TOKENS groups
    if (pTokens > MAX_TOKENS) {
      if (currentParagraphs.length > 0) {
        subChunks.push({
          headingPath: section.headingPath,
          headingText: section.headingText,
          body: currentParagraphs.join('\n\n'),
        })
        currentParagraphs = []
        currentTokens = 0
      }
      for (const lineSub of splitByLines(paragraph, section.headingPath, section.headingText)) {
        subChunks.push(lineSub)
      }
      continue
    }

    // If adding this paragraph would exceed TARGET_TOKENS, flush
    if (currentTokens + pTokens > TARGET_TOKENS && currentParagraphs.length > 0) {
      subChunks.push({
        headingPath: section.headingPath,
        headingText: section.headingText,
        body: currentParagraphs.join('\n\n'),
      })
      currentParagraphs = []
      currentTokens = 0
    }

    currentParagraphs.push(paragraph)
    currentTokens += pTokens
  }

  if (currentParagraphs.length > 0) {
    subChunks.push({
      headingPath: section.headingPath,
      headingText: section.headingText,
      body: currentParagraphs.join('\n\n'),
    })
  }

  // Prepend overlap to sub-chunks after the first
  // The first sub-chunk may get overlap from prevChunkBody
  const result: Section[] = []
  for (let i = 0; i < subChunks.length; i++) {
    if (i === 0) {
      // First sub-chunk: no overlap prepended here (caller handles prevBody tracking)
      result.push(subChunks[i])
    } else {
      // Subsequent sub-chunks: prepend overlap from previous sub-chunk
      const overlapText = getOverlapText(subChunks[i - 1].body)
      const body = overlapText
        ? overlapText + '\n\n' + subChunks[i].body
        : subChunks[i].body
      result.push({
        headingPath: section.headingPath,
        headingText: section.headingText,
        body,
      })
    }
  }

  return result
}
