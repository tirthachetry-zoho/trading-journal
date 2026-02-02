type RateLimitOptions = {
  windowMs: number
  max: number
}

type Entry = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Entry>()

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const entry: Entry = { count: 1, resetAt: now + options.windowMs }
    buckets.set(key, entry)
    return { allowed: true as const, remaining: options.max - 1, resetAt: entry.resetAt }
  }

  if (existing.count >= options.max) {
    return { allowed: false as const, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  buckets.set(key, existing)

  return {
    allowed: true as const,
    remaining: Math.max(0, options.max - existing.count),
    resetAt: existing.resetAt,
  }
}

export function getClientIp(request: Request) {
  const xfwd = request.headers.get('x-forwarded-for')
  if (xfwd) {
    const first = xfwd.split(',')[0]?.trim()
    if (first) return first
  }
  const xreal = request.headers.get('x-real-ip')
  if (xreal) return xreal
  return 'unknown'
}
