// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>()

export function getCachedData(key: string): unknown | null {
  const cached = cache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key)
    return null
  }

  return cached.data
}

export function setCachedData(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  })
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

export function clearCacheByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

export function getCacheStats() {
  const now = Date.now()
  const entries = Array.from(cache.entries())
  
  return {
    totalEntries: entries.length,
    expiredEntries: entries.filter(([, cached]) => now - cached.timestamp > cached.ttl).length,
    validEntries: entries.filter(([, cached]) => now - cached.timestamp <= cached.ttl).length
  }
}

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  TRADES: 2 * 60 * 1000, // 2 minutes
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  INSIGHTS: 10 * 60 * 1000, // 10 minutes
  DAILY_TRADES: 1 * 60 * 1000, // 1 minute
} as const
