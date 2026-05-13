const BASE = 'https://webdriver.io/docs/'

export function slugFromUrl(url: string): string {
  let path = url.startsWith(BASE) ? url.slice(BASE.length) : url
  path = path.replace(/\/$/, '')

  if (!path) return 'index'

  return path.replace(/\//g, '-').toLowerCase()
}
