import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { cleanMarkdown } from './cleanMarkdown'

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  fence: '```',
  bulletListMarker: '-',
})

td.use(gfm)

td.remove([
  'nav',
  'footer',
  'script',
  'style',
  'aside',
  '.navbar',
  '.sidebar',
  '.table-of-contents',
  '.pagination-nav',
  '.theme-doc-toc-desktop',
  '.theme-doc-breadcrumbs',
  '.tocCollapsible',
  '.cookie-consent',
])

export function htmlToMarkdown(html: string): string {
  return cleanMarkdown(td.turndown(html))
}
