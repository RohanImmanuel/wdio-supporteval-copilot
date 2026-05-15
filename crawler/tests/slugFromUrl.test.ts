import { describe, it, expect } from 'vitest'
import { slugFromUrl } from '../src/slugFromUrl'

describe('slugFromUrl', () => {
  it('returns "index" for the /docs/ root', () => {
    expect(slugFromUrl('https://webdriver.io/docs/')).toBe('index')
  })

  it('handles a top-level doc page', () => {
    expect(slugFromUrl('https://webdriver.io/docs/configuration/')).toBe('configuration')
  })

  it('handles a top-level doc page without trailing slash', () => {
    expect(slugFromUrl('https://webdriver.io/docs/selectors')).toBe('selectors')
  })

  it('converts nested API paths to hyphen-separated slugs', () => {
    expect(slugFromUrl('https://webdriver.io/docs/api/browser/url/')).toBe('api-browser-url')
  })

  it('converts element API paths', () => {
    expect(slugFromUrl('https://webdriver.io/docs/api/element/click/')).toBe('api-element-click')
  })

  it('is lowercase', () => {
    expect(slugFromUrl('https://webdriver.io/docs/GettingStarted/')).toBe('gettingstarted')
  })
})
