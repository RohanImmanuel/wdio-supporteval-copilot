import { describe, it, expect } from 'vitest'
import { slugFromUrl } from '../src/chunker/slugFromUrl'

describe('slugFromUrl', () => {
  it('returns "index" for base URL', () => {
    expect(slugFromUrl('https://webdriver.io/docs/')).toBe('index')
  })

  it('converts path segments to dash-separated slug', () => {
    expect(slugFromUrl('https://webdriver.io/docs/api/browser')).toBe('api-browser')
  })

  it('strips trailing slash', () => {
    expect(slugFromUrl('https://webdriver.io/docs/configuration/')).toBe('configuration')
  })
})
