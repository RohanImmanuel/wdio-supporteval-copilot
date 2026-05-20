import path from 'path'
import {
  CHUNKS_FILE,
  VECTORS_FILE,
  MANIFEST_FILE,
  EMBEDDING_MODEL,
  REQUEST_DELAY_MS,
  MAX_RETRIES,
  BACKOFF_MS,
} from './config'
import { readChunks } from './readChunks'
import { readExistingVectors } from './readExistingVectors'
import { buildCache, getCached } from './embeddingCache'
import { buildEmbeddingInput } from './buildEmbeddingInput'
import { createGeminiClient } from './geminiEmbeddingClient'
import { appendVectorRecord } from './writeVectorRecord'
import { dedupeVectors } from './dedupeVectors'
import { buildVectorManifest, saveVectorManifest } from './vectorManifest'
import { withRetry } from './retry'
import { VectorRecord } from './types'

async function main() {
  // 1. Check GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.')
    process.exit(1)
  }

  // 2. Read chunks
  console.log('Starting embedding generation')
  console.log(`Input: ${path.relative(process.cwd(), CHUNKS_FILE)}`)
  const chunks = readChunks(CHUNKS_FILE)
  console.log(`Chunks found: ${chunks.length}`)

  // 3. Read existing vectors, build cache
  const existingVectors = readExistingVectors(VECTORS_FILE)
  console.log(`Existing vectors found: ${existingVectors.length}`)
  console.log(`Embedding model: ${EMBEDDING_MODEL}`)
  console.log()

  const cache = buildCache(existingVectors)

  // Separate cached vs to-embed
  const toEmbed = chunks.filter((c) => !getCached(cache, c, EMBEDDING_MODEL))
  const reusedFromCacheCount = chunks.length - toEmbed.length

  console.log(`Reused from cache: ${reusedFromCacheCount}`)
  console.log(`Remaining to embed: ${toEmbed.length}`)
  console.log()

  const client = createGeminiClient(apiKey)

  let newlyEmbedded = 0
  let embeddingDimension = 0

  // Write cached records first (only those not already in the file)
  // Since we're appending, existing vectors file already has them — we'll dedupe at end

  // 4. For each chunk: check cache → embed → appendVectorRecord
  for (const chunk of chunks) {
    const cached = getCached(cache, chunk, EMBEDDING_MODEL)
    if (cached) {
      // Already in file, skip
      continue
    }

    const text = buildEmbeddingInput(chunk)

    let embedding: number[]
    try {
      embedding = await withRetry(
        () => client.embed(text),
        chunk.chunk_id,
        MAX_RETRIES,
        BACKOFF_MS
      )
    } catch (err) {
      console.log(`Failed after ${MAX_RETRIES} retries: ${chunk.chunk_id}`)
      console.log('Progress saved. Rerun npm run embed:docs to continue.')

      // Write partial manifest
      const manifest = buildVectorManifest({
        chunkCount: chunks.length,
        vectorCount: newlyEmbedded + reusedFromCacheCount,
        reusedFromCache: reusedFromCacheCount,
        newlyEmbedded,
        embeddingDimension,
        status: 'partial',
      })
      saveVectorManifest(manifest)
      return
    }

    if (embeddingDimension === 0) {
      embeddingDimension = embedding.length
    }

    const record: VectorRecord = {
      chunk_id: chunk.chunk_id,
      doc_id: chunk.doc_id,
      title: chunk.title,
      url: chunk.url,
      heading_path: chunk.heading_path,
      content: chunk.content,
      token_count: chunk.token_count,
      content_hash: chunk.content_hash,
      crawled_at: chunk.crawled_at,
      chunk_index: chunk.chunk_index,
      embedding_model: EMBEDDING_MODEL,
      embedding,
      metadata: { source: 'webdriverio' },
    }

    appendVectorRecord(VECTORS_FILE, record)
    console.log(`Embedded: ${chunk.chunk_id}`)
    newlyEmbedded++

    // Rate limit delay
    if (REQUEST_DELAY_MS > 0) {
      await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS))
    }
  }

  // 5. Deduplicate vectors.jsonl
  dedupeVectors(VECTORS_FILE)

  // Recalculate embedding dimension from existing vectors if we didn't embed any new ones
  if (embeddingDimension === 0 && existingVectors.length > 0) {
    embeddingDimension = existingVectors[0].embedding.length
  }

  const vectorCount = reusedFromCacheCount + newlyEmbedded

  // 6. Write manifest
  const manifest = buildVectorManifest({
    chunkCount: chunks.length,
    vectorCount,
    reusedFromCache: reusedFromCacheCount,
    newlyEmbedded,
    embeddingDimension,
    status: 'complete',
  })
  saveVectorManifest(manifest)

  // 7. Print summary
  console.log('Embedding complete')
  console.log(`Vectors written: ${vectorCount}`)
  console.log(`Newly embedded: ${newlyEmbedded}`)
  console.log(`Reused from cache: ${reusedFromCacheCount}`)
  console.log(`Output: ${path.relative(process.cwd(), VECTORS_FILE)}`)
  console.log(`Manifest: ${path.relative(process.cwd(), MANIFEST_FILE)}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
