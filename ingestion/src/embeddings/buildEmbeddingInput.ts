import { Chunk } from './types'

/**
 * Convert heading_path like "# Browser | ## getGeoLocation"
 * to "Browser > getGeoLocation" (strip leading #s and spaces, replace " | " with " > ")
 */
function formatHeadingPath(headingPath: string): string {
  return headingPath
    .split(' | ')
    .map((segment) => segment.replace(/^#+\s*/, '').trim())
    .join(' > ')
}

export function buildEmbeddingInput(chunk: Chunk): string {
  const lines: string[] = []

  lines.push(`Title: ${chunk.title}`)

  if (chunk.heading_path && chunk.heading_path.trim().length > 0) {
    lines.push(`Section: ${formatHeadingPath(chunk.heading_path)}`)
  }

  lines.push(`Source: ${chunk.url}`)
  lines.push('')
  lines.push(chunk.content)

  return lines.join('\n')
}
