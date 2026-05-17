export interface Chunk {
  chunk_id: string
  doc_id: string
  title: string
  url: string
  heading_path: string
  content: string
  token_count: number
  content_hash: string
  crawled_at: string
  chunk_index: number
}

export interface ChunkManifest {
  generated_at: string
  total_chunks: number
  total_docs: number
  chunks_file: string
  stats: {
    min_tokens: number
    max_tokens: number
    avg_tokens: number
  }
}
