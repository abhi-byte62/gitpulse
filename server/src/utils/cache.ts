import { LRUCache } from 'lru-cache';

const ttlSeconds = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

// In-memory LRU Cache for GitHub API responses to prevent rate limiting
export const apiCache = new LRUCache<string, any>({
  max: 500, // store up to 500 cached responses
  ttl: ttlSeconds * 1000, // default 5 minutes
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

export function getCached<T>(key: string): T | undefined {
  return apiCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T, customTtlMs?: number): void {
  apiCache.set(key, value, { ttl: customTtlMs ?? ttlSeconds * 1000 });
}

export function invalidateCache(keyPrefix: string): void {
  for (const key of apiCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      apiCache.delete(key);
    }
  }
}
