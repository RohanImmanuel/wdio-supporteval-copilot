export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw)
    url.search = ''
    url.hash = ''
    if (url.pathname !== '/' && !url.pathname.endsWith('/') && !url.pathname.includes('.')) {
      url.pathname = url.pathname + '/'
    }
    return url.toString()
  } catch {
    return raw
  }
}
