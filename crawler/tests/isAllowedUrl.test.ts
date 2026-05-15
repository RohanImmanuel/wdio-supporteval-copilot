import { describe, it, expect } from 'vitest'
import { isAllowedUrl } from '../src/isAllowedUrl'

describe('isAllowedUrl', () => {
  // Allowed cases
  it('allows /docs/ root', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/')).toBe(true)
  })

  it('allows /docs/configuration/', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/configuration/')).toBe(true)
  })

  it('allows /docs/api/browser/url/', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/api/browser/url/')).toBe(true)
  })

  // Blocked by path segment
  it('blocks /blog/', () => {
    expect(isAllowedUrl('https://webdriver.io/blog/')).toBe(false)
  })

  it('blocks /community/', () => {
    expect(isAllowedUrl('https://webdriver.io/community/')).toBe(false)
  })

  it('blocks /sponsor/', () => {
    expect(isAllowedUrl('https://webdriver.io/sponsor/')).toBe(false)
  })

  it('blocks /versions/', () => {
    expect(isAllowedUrl('https://webdriver.io/versions/')).toBe(false)
  })

  // Blocked by versioned path
  it('blocks versioned docs /docs/v8/', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/v8/configuration/')).toBe(false)
  })

  it('blocks versioned docs /docs/v7/', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/v7/selectors/')).toBe(false)
  })

  // Blocked by extension
  it('blocks .png image URLs', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/img/diagram.png')).toBe(false)
  })

  it('blocks .css files', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/assets/main.css')).toBe(false)
  })

  it('blocks .js files', () => {
    expect(isAllowedUrl('https://webdriver.io/docs/assets/bundle.js')).toBe(false)
  })

  // Blocked: external domain
  it('blocks external domains', () => {
    expect(isAllowedUrl('https://github.com/webdriverio/webdriverio')).toBe(false)
  })

  it('blocks http (non-https)', () => {
    expect(isAllowedUrl('http://webdriver.io/docs/configuration/')).toBe(false)
  })
})
