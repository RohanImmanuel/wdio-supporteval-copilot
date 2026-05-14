import fs from 'fs'
import { MANIFEST_FILE, OUTPUT_DIR, START_URLS } from './config'

export interface ManifestPage {
  title: string
  url: string
  markdown_file: string
  raw_html_file: string
  status: 'success'
}

export interface FailedPage {
  url: string
  status: 'failed'
  error: string
}

export interface Manifest {
  source: string
  base_urls: string[]
  crawled_at: string
  page_count: number
  failed_count: number
  pages: ManifestPage[]
  failed_pages: FailedPage[]
}

export function buildManifest(
  crawledAt: string,
  pages: ManifestPage[],
  failedPages: FailedPage[],
): Manifest {
  return {
    source: 'webdriverio',
    base_urls: START_URLS,
    crawled_at: crawledAt,
    page_count: pages.length,
    failed_count: failedPages.length,
    pages,
    failed_pages: failedPages,
  }
}

export function saveManifest(manifest: Manifest): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8')
}
