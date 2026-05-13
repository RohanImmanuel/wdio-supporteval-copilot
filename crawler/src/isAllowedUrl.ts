import { ALLOWED_PREFIXES, BLOCKED_PATH_SEGMENTS, BLOCKED_EXTENSIONS } from './config'

export function isAllowedUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return false
  }

  if (parsed.protocol !== 'https:' || parsed.hostname !== 'webdriver.io') return false

  const fullUrl = parsed.origin + parsed.pathname
  if (!ALLOWED_PREFIXES.some(prefix => fullUrl.startsWith(prefix))) return false

  if (BLOCKED_PATH_SEGMENTS.some(seg => parsed.pathname.includes(seg))) return false

  // /docs/v8/, /docs/5.0/, etc. are separate versioned sites
  if (/\/docs\/v?\d/.test(parsed.pathname)) return false

  const lastSegment = parsed.pathname.split('/').pop() ?? ''
  const ext = lastSegment.includes('.') ? lastSegment.split('.').pop()!.toLowerCase() : ''
  if (ext && BLOCKED_EXTENSIONS.has(ext)) return false

  return true
}
