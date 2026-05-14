import { normalizeUrl } from './normalizeUrl'
import { isAllowedUrl } from './isAllowedUrl'
import { extractLinks } from './extractLinks'
import { extractArticleHtml } from './extractArticleHtml'
import { savePage, ensureOutputDirs } from './savePage'
import { buildManifest, saveManifest } from './manifest'
import type { ManifestPage, FailedPage } from './manifest'
import {
  START_URLS,
  MAX_PAGES,
  REQUEST_DELAY_MS,
  MAX_RETRIES,
  MARKDOWN_DIR,
  MANIFEST_FILE,
} from './config'

describe('WDIO Docs Crawler', () => {
  it('crawls wdio docs and saves markdown + manifest', async () => {
    const queue: string[] = START_URLS.map(normalizeUrl)
    const queued = new Set<string>(queue)
    const visited = new Set<string>()
    const pages: ManifestPage[] = []
    const failedPages: FailedPage[] = []
    const crawlStartedAt = new Date().toISOString()

    ensureOutputDirs()
    console.log('\nStarting WDIO docs crawl')
    console.log(`Start URLs: ${START_URLS.length}`)
    console.log(`Max pages: ${MAX_PAGES}`)

    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const url = queue.shift()!
      visited.add(url)

      const pageIndex = visited.size
      console.log(`\n[${pageIndex}/${MAX_PAGES}] Crawling ${url}`)

      let succeeded = false
      let lastError = ''

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          await browser.url(url)

          const title = await browser.getTitle()
          const articleHtml = await extractArticleHtml(browser)
          const crawledAt = new Date().toISOString()

          const saved = savePage(url, title, articleHtml, crawledAt)
          console.log(`Saved markdown: ${saved.markdownFile}`)

          const rawLinks = await extractLinks(browser, url)
          let discovered = 0
          for (const raw of rawLinks) {
            const norm = normalizeUrl(raw)
            if (isAllowedUrl(norm) && !visited.has(norm) && !queued.has(norm)) {
              queue.push(norm)
              queued.add(norm)
              discovered++
            }
          }
          console.log(`Discovered links: ${discovered}`)

          pages.push({
            title: saved.title,
            url,
            markdown_file: saved.markdownFile,
            raw_html_file: saved.rawHtmlFile,
            status: 'success',
          })

          succeeded = true
          break
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err)
          if (attempt < MAX_RETRIES) {
            console.warn(`  Attempt ${attempt + 1} failed, retrying…`)
            await browser.pause(1000)
          }
        }
      }

      if (!succeeded) {
        console.error(`  Failed: ${lastError}`)
        failedPages.push({ url, status: 'failed', error: lastError })
      }

      if (queue.length > 0 && visited.size < MAX_PAGES) {
        await browser.pause(REQUEST_DELAY_MS)
      }
    }

    const manifest = buildManifest(crawlStartedAt, pages, failedPages)
    saveManifest(manifest)

    console.log('\nCrawl complete')
    console.log(`Pages saved: ${pages.length}`)
    console.log(`Failed pages: ${failedPages.length}`)
    console.log(`Output: ${MARKDOWN_DIR}`)
    console.log(`Manifest: ${MANIFEST_FILE}`)

    expect(pages.length).toBeGreaterThan(0)
  })
})
