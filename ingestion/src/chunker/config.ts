import path from 'path'

export const DOCS_DIR = path.resolve(__dirname, '../../../docs_dataset/markdown')
export const CHUNKS_DIR = path.resolve(__dirname, '../../../docs_dataset/chunks')
export const CHUNKS_FILE = path.join(CHUNKS_DIR, 'chunks.jsonl')
export const MANIFEST_FILE = path.join(CHUNKS_DIR, 'chunk_manifest.json')

export const MIN_TOKENS = 150
export const TARGET_TOKENS = 600
export const MAX_TOKENS = 1000
export const OVERLAP_TOKENS = 100
