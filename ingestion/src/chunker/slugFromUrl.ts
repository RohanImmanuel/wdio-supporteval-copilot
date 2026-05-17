const BASE = 'https://webdriver.io/docs/'

export function slugFromUrl(url: string): string {
  let p = url.startsWith(BASE) ? url.slice(BASE.length) : url
  p = p.replace(/\/$/, '')
  if (!p) return 'index'
  return p.replace(/\//g, '-').toLowerCase()
}
