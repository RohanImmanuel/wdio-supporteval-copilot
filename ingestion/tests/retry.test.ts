import { describe, it, expect, vi } from 'vitest'
import { withRetry } from '../src/embeddings/retry'

// Use zero-delay backoffs so tests run fast
const FAST_BACKOFF = [0, 0, 0] as const

describe('withRetry', () => {
  it('succeeds on first try without delay', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn, 'test-label', 3, FAST_BACKOFF)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('success')
    const result = await withRetry(fn, 'test-label', 3, FAST_BACKOFF)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('throws after maxRetries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent error'))
    await expect(withRetry(fn, 'test-label', 3, FAST_BACKOFF)).rejects.toThrow(
      'Failed after 3 retries'
    )
  })

  it('calls fn the correct number of times (maxRetries + 1 total attempts)', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'))
    await expect(withRetry(fn, 'test-label', 3, FAST_BACKOFF)).rejects.toThrow()
    // initial attempt + 3 retries = 4 total calls
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('succeeds after multiple retries', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('eventual success')
    const result = await withRetry(fn, 'test-label', 3, FAST_BACKOFF)
    expect(result).toBe('eventual success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('logs rate limit message when error contains "429"', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('HTTP 429 Too Many Requests'))
      .mockResolvedValue('ok')

    await withRetry(fn, 'chunk-xyz', 3, FAST_BACKOFF)
    expect(consoleSpy).toHaveBeenCalledWith('Rate limit hit for chunk-xyz')
    consoleSpy.mockRestore()
  })

  it('logs rate limit message when error contains "rate limit"', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('rate limit exceeded'))
      .mockResolvedValue('ok')

    await withRetry(fn, 'chunk-abc', 3, FAST_BACKOFF)
    expect(consoleSpy).toHaveBeenCalledWith('Rate limit hit for chunk-abc')
    consoleSpy.mockRestore()
  })
})
