export async function extractLinks(b: WebdriverIO.Browser, pageUrl: string): Promise<string[]> {
  const anchors = await b.$$('a[href]')
  const result: string[] = []

  for (const anchor of anchors) {
    try {
      const href = await anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        continue
      }

      const absolute = new URL(href, pageUrl).toString()
      result.push(absolute)
    } catch {
      // ignore
    }
  }

  return result
}
