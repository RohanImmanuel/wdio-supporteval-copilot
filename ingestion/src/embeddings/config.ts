import path from 'path'

export const CHUNKS_FILE = path.resolve(__dirname, '../../../docs_dataset/chunks/chunks.jsonl')
export const VECTORS_DIR = path.resolve(__dirname, '../../../docs_dataset/vectors')
export const VECTORS_FILE = path.join(VECTORS_DIR, 'vectors.jsonl')
export const MANIFEST_FILE = path.join(VECTORS_DIR, 'vector_manifest.json')

export const EMBEDDING_MODEL = 'gemini-embedding-001'
export const REQUEST_DELAY_MS = 500
export const MAX_RETRIES = 3
export const BACKOFF_MS = [5000, 15000, 30000] as const
