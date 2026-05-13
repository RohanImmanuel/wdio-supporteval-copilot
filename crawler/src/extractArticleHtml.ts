import { ARTICLE_SELECTORS, PAGE_TIMEOUT_MS } from './config'

const COMBINED_SELECTOR = ARTICLE_SELECTORS.join(', ')

export async function extractArticleHtml(b: WebdriverIO.Browser): Promise<string> {
  const el = await b.$(COMBINED_SELECTOR)
  await el.waitForExist({ timeout: PAGE_TIMEOUT_MS })
  return el.getHTML()
}
