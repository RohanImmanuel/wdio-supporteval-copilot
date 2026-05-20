import path from 'path'
import {
  CHUNKS_FILE,
  VECTORS_FILE,
  MANIFEST_FILE,
  EMBEDDING_MODEL,
  BATCH_SIZE,
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

async function countdown(ms: number): Promise<void> {
  let remaining = Math.ceil(ms / 1000)
  while (remaining > 0) {
    process.stdout.write(`\r  Next batch in ${remaining}s...   `)
    await new Promise(r => setTimeout(r, 1000))
    remaining--
  }
  process.stdout.write('\r' + ' '.repeat(30) + '\r')
}

function saveProgress(
  chunks: { length: number },
  reusedFromCacheCount: number,
  newlyEmbedded: number,
  embeddingDimension: number,
  existingVectors: { embedding: number[] }[],
  status: 'complete' | 'partial'
) {
  dedupeVectors(VECTORS_FILE)
  const dim = embeddingDimension || (existingVectors[0]?.embedding.length ?? 0)
  const manifest = buildVectorManifest({
    chunkCount: chunks.length,
    vectorCount: reusedFromCacheCount + newlyEmbedded,
    reusedFromCache: reusedFromCacheCount,
    newlyEmbedded,
    embeddingDimension: dim,
    status,
  })
  saveVectorManifest(manifest)
}

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

  process.on('SIGINT', () => {
    process.stdout.write('\n')
    console.log('Interrupted. Saving progress...')
    saveProgress(chunks, reusedFromCacheCount, newlyEmbedded, embeddingDimension, existingVectors, 'partial')
    console.log('Progress saved. Rerun npm run embed:docs to continue.')
    process.exit(0)
  })

  // 4. Process uncached chunks in batches
  for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
    const batch = toEmbed.slice(i, i + BATCH_SIZE)
    const batchLabel = `batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toEmbed.length / BATCH_SIZE)}`
    const texts = batch.map(buildEmbeddingInput)

    let embeddings: number[][]
    try {
      embeddings = await withRetry(
        () => client.embedBatch(texts),
        batchLabel,
        MAX_RETRIES,
        BACKOFF_MS
      )
    } catch (err) {
      console.log(`Failed after ${MAX_RETRIES} retries: ${batchLabel}`)
      console.log('Progress saved. Rerun npm run embed:docs to continue.')

      saveProgress(chunks, reusedFromCacheCount, newlyEmbedded, embeddingDimension, existingVectors, 'partial')
      return
    }

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j]
      const embedding = embeddings[j]

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
      newlyEmbedded++
    }

    const totalEmbedded = reusedFromCacheCount + newlyEmbedded
    const pct = ((totalEmbedded / chunks.length) * 100).toFixed(1)
    console.log(`Embedded ${batchLabel} (${totalEmbedded}/${chunks.length} chunks, ${pct}%)`)

    if (i + BATCH_SIZE < toEmbed.length && REQUEST_DELAY_MS > 0) {
      await countdown(REQUEST_DELAY_MS)
    }
  }

  saveProgress(chunks, reusedFromCacheCount, newlyEmbedded, embeddingDimension, existingVectors, 'complete')

  const vectorCount = reusedFromCacheCount + newlyEmbedded
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
