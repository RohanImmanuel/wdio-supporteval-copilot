import fs from 'fs'
import path from 'path'
import { MARKDOWN_DIR, RAW_HTML_DIR } from './config'
import { slugFromUrl } from './slugFromUrl'
import { htmlToMarkdown } from './htmlToMarkdown'

export interface SavedPage {
  title: string
  url: string
  markdownFile: string
  rawHtmlFile: string
}

export function ensureOutputDirs(): void {
  fs.mkdirSync(MARKDOWN_DIR, { recursive: true })
  fs.mkdirSync(RAW_HTML_DIR, { recursive: true })
}

export function savePage(
  url: string,
  title: string,
  html: string,
  crawledAt: string,
): SavedPage {
  const slug = slugFromUrl(url)
  const markdownFile = `${slug}.md`
  const rawHtmlFile = `${slug}.html`

  const markdown = htmlToMarkdown(html)
  const safeTitle = title.replace(/"/g, '\\"')
  const content = `---
title: "${safeTitle}"
source_url: "${url}"
crawled_at: "${crawledAt}"
crawler: "wdio"
---

${markdown}
`

  fs.writeFileSync(path.join(MARKDOWN_DIR, markdownFile), content, 'utf8')
  fs.writeFileSync(path.join(RAW_HTML_DIR, rawHtmlFile), html, 'utf8')

  return { title, url, markdownFile, rawHtmlFile }
}
