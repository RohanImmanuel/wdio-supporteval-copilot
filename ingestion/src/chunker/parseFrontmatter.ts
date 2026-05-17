import matter from 'gray-matter'

interface ParsedFile {
  title: string
  url: string
  crawled_at: string
  content: string
}

export function parseFrontmatter(raw: string): ParsedFile {
  const parsed = matter(raw)
  const { title, url, source_url, crawled_at } = parsed.data

  const crawledAtStr =
    crawled_at instanceof Date ? crawled_at.toISOString() : String(crawled_at)

  // Crawler writes source_url; fall back to url for compatibility
  const resolvedUrl = source_url ?? url ?? ''

  return {
    title: String(title ?? ''),
    url: String(resolvedUrl),
    crawled_at: crawledAtStr,
    content: parsed.content,
  }
}
