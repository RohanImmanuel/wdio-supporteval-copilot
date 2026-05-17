import type { Section } from './splitMarkdownSections'
import { countTokens } from './tokenCounter'
import { MIN_TOKENS, TARGET_TOKENS } from './config'

export function mergeSmallSections(sections: Section[]): Section[] {
  if (sections.length === 0) return []

  const result: Section[] = []
  let buffer: Section | null = null

  for (const section of sections) {
    const sectionTokens = countTokens(section.body)

    if (buffer === null) {
      buffer = { ...section }
      continue
    }

    const bufferTokens = countTokens(buffer.body)

    // If buffer is small and merging would stay under TARGET_TOKENS, merge
    if (bufferTokens < MIN_TOKENS) {
      const mergedBody = buffer.body
        ? buffer.body + '\n\n' + section.body
        : section.body
      const mergedTokens = countTokens(mergedBody)

      if (mergedTokens <= TARGET_TOKENS) {
        // Merge: keep first section's headingPath
        buffer = {
          headingPath: buffer.headingPath,
          headingText: buffer.headingText,
          body: mergedBody,
        }
        continue
      }
    }

    // Flush buffer and start new one
    result.push(buffer)
    buffer = { ...section }
  }

  if (buffer !== null) {
    result.push(buffer)
  }

  return result
}
