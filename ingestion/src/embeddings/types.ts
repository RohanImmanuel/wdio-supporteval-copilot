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

export interface VectorRecord {
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
  embedding_model: string
  embedding: number[]
  metadata: { source: 'webdriverio' }
}

export interface VectorManifest {
  generated_at: string
  input_file: string
  output_file: string
  chunk_count: number
  vector_count: number
  reused_from_cache: number
  newly_embedded: number
  embedding_model: string
  embedding_dimension: number
  status: 'complete' | 'partial'
}
