async function countdown(ms: number, prefix: string): Promise<void> {
  let remaining = Math.ceil(ms / 1000)
  while (remaining > 0) {
    process.stdout.write(`\r  ${prefix} ${remaining}s...   `)
    await new Promise(r => setTimeout(r, 1000))
    remaining--
  }
  process.stdout.write('\r' + ' '.repeat(40) + '\r')
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries: number,
  backoffMs: readonly number[]
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const errMsg = err instanceof Error ? err.message : String(err)
      const isRateLimit =
        errMsg.toLowerCase().includes('rate limit') || errMsg.includes('429')

      if (attempt < maxRetries) {
        if (isRateLimit) {
          console.log(`Rate limit hit for ${label}`)
        } else {
          console.log(`Failed attempt for ${label}: ${errMsg}`)
        }
        const delay = backoffMs[attempt] ?? backoffMs[backoffMs.length - 1]
        const delaySec = Math.round(delay / 1000)
        console.log(`Retrying in ${delaySec}s... (attempt ${attempt + 1}/${maxRetries})`)
        await countdown(delay, `Retrying in`)
      }
    }
  }

  throw new Error(
    `Failed after ${maxRetries} retries: ${label} — ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  )
}
