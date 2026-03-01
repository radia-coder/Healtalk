import { SERVER_CACHE_SIZE_LIMIT } from "@/lib/constants";

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

type GlobalCacheStore = {
  values: Map<string, CacheEntry>;
  inFlight: Map<string, Promise<unknown>>;
};

// Store the cache on `globalThis` so it survives Next.js hot-reloads in dev
// while still being a single shared instance across all requests.
const globalStore = globalThis as typeof globalThis & {
  __healTalkServerCache?: GlobalCacheStore;
};

const store: GlobalCacheStore =
  globalStore.__healTalkServerCache ?? {
    values: new Map<string, CacheEntry>(),
    inFlight: new Map<string, Promise<unknown>>(),
  };

if (!globalStore.__healTalkServerCache) {
  globalStore.__healTalkServerCache = store;
}

/**
 * Returns the cached value for `key` if it hasn't expired, otherwise calls
 * `loader()` to fetch a fresh value, caches it for `ttlMs` milliseconds, and
 * returns it.
 *
 * Concurrent calls for the same key while a loader is in-flight will all
 * receive the same promise — the loader only runs once.
 *
 * Cache cleanup strategy: expired entries are only evicted when the cache
 * grows beyond SERVER_CACHE_SIZE_LIMIT. This is a best-effort sweep, not a
 * guaranteed TTL — entries can linger past their expiry if the cache stays small.
 */
export const getOrSetServerCache = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> => {
  if (ttlMs <= 0) throw new Error("ttlMs must be a positive number");

  const now = Date.now();
  const existing = store.values.get(key);

  // Cache hit — return immediately if the entry is still fresh.
  if (existing && existing.expiresAt > now) {
    return existing.value as T;
  }

  // If another request is already loading this key, share that promise.
  const pending = store.inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = loader()
    .then((value) => {
      store.values.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
      store.inFlight.delete(key);
      return value;
    })
    .catch((error) => {
      store.inFlight.delete(key);
      throw error;
    });

  store.inFlight.set(key, promise as Promise<unknown>);

  // Opportunistic cleanup: only scan for stale entries when the map is large.
  // This keeps the overhead O(1) on the happy path.
  if (store.values.size > SERVER_CACHE_SIZE_LIMIT) {
    for (const [cachedKey, entry] of store.values) {
      if (entry.expiresAt <= now) {
        store.values.delete(cachedKey);
      }
    }
  }

  return promise;
};
