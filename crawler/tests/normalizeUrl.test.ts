import { describe, it, expect } from 'vitest'
import { normalizeUrl } from '../src/normalizeUrl'

describe('normalizeUrl', () => {
  it('strips hash fragments', () => {
    expect(normalizeUrl('https://webdriver.io/docs/configuration/#capabilities')).toBe(
      'https://webdriver.io/docs/configuration/'
    )
  })

  it('strips query strings', () => {
    expect(normalizeUrl('https://webdriver.io/docs/selectors/?foo=bar')).toBe(
      'https://webdriver.io/docs/selectors/'
    )
  })

  it('strips both query string and hash', () => {
    expect(normalizeUrl('https://webdriver.io/docs/api/browser/url/?v=8#example')).toBe(
      'https://webdriver.io/docs/api/browser/url/'
    )
  })

  it('preserves URLs that are already clean', () => {
    expect(normalizeUrl('https://webdriver.io/docs/configuration/')).toBe(
      'https://webdriver.io/docs/configuration/'
    )
  })

  it('adds trailing slash to paths without a file extension', () => {
    expect(normalizeUrl('https://webdriver.io/docs/configuration')).toBe(
      'https://webdriver.io/docs/configuration/'
    )
  })

  it('handles root /docs/ path', () => {
    expect(normalizeUrl('https://webdriver.io/docs/')).toBe(
      'https://webdriver.io/docs/'
    )
  })
})
