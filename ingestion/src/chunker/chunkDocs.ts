import fs from 'fs'
import path from 'path'
import { DOCS_DIR, MAX_TOKENS } from './config'
import { parseFrontmatter } from './parseFrontmatter'
import { slugFromUrl } from './slugFromUrl'
import { splitMarkdownSections } from './splitMarkdownSections'
import { mergeSmallSections } from './mergeSmallSections'
import { splitLargeSection } from './splitLargeSections'
import { countTokens } from './tokenCounter'
import { contentHash } from './contentHash'
import { generateChunkId } from './generateChunkId'
import { buildChunkManifest } from './chunkManifest'
import { writeChunks } from './writeChunks'
import type { Chunk } from './types'

function processFile(filePath: string): Chunk[] {
  const raw = fs.readFileSync(filePath, 'utf8')
  const { title, url, crawled_at, content } = parseFrontmatter(raw)
  const docId = slugFromUrl(url)

  const sections = mergeSmallSections(splitMarkdownSections(content))

  const chunks: Chunk[] = []
  let chunkIndex = 0
  let prevBody: string | undefined

  for (const section of sections) {
    const subsections =
      countTokens(section.body) > MAX_TOKENS
        ? splitLargeSection(section, prevBody)
        : [section]

    for (const sub of subsections) {
      if (!sub.body.trim()) continue

      const hash = contentHash(sub.body)

      chunks.push({
        chunk_id: generateChunkId(docId, sub.headingPath, chunkIndex),
        doc_id: docId,
        title,
        url,
        heading_path: sub.headingPath,
        content: sub.body,
        token_count: countTokens(sub.body),
        content_hash: hash,
        crawled_at,
        chunk_index: chunkIndex,
      })
      prevBody = sub.body
      chunkIndex++
    }
  }

  return chunks
}

function main() {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(DOCS_DIR, f))
    .sort()

  console.log(`Processing ${files.length} markdown files...`)

  const allChunks: Chunk[] = []
  for (const file of files) {
    try {
      const chunks = processFile(file)
      allChunks.push(...chunks)
    } catch (err) {
      console.error(
        `Failed to process ${path.basename(file)}: ${err instanceof Error ? err.message : err}`,
      )
    }
  }

  const manifest = buildChunkManifest(allChunks)
  writeChunks(allChunks, manifest)

  console.log(`Done. ${allChunks.length} chunks from ${files.length} docs`)
  console.log(`Output: docs_dataset/chunks/`)
}

main()
