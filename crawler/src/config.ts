import path from 'path'

export const START_URLS = [
  'https://webdriver.io/docs/',
  'https://webdriver.io/docs/api/',
]

export const ALLOWED_PREFIXES = [
  'https://webdriver.io/docs/',
]

export const BLOCKED_PATH_SEGMENTS = [
  '/blog/',
  '/community/',
  '/sponsor/',
  '/versions/',
  '/search/',
]

export const BLOCKED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
  'css', 'js', 'mjs',
  'pdf', 'ico', 'woff', 'woff2', 'ttf', 'eot',
])

export const MAX_PAGES = 350
export const REQUEST_DELAY_MS = 500
export const MAX_RETRIES = 2
export const PAGE_TIMEOUT_MS = 15000

export const OUTPUT_DIR = path.resolve(__dirname, '../../docs_dataset')
export const MARKDOWN_DIR = path.join(OUTPUT_DIR, 'markdown')
export const RAW_HTML_DIR = path.join(OUTPUT_DIR, 'raw_html')
export const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json')

export const ARTICLE_SELECTORS = [
  'article',
  'main article',
  '.theme-doc-markdown',
  '.markdown',
]
