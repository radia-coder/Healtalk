import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Redis is optional — if not configured, we fall back to an in-process memory store.
const redis =
  redisUrl && redisToken
    ? new Redis({ url: redisUrl, token: redisToken })
    : null;

const limiterCache = new Map<string, Ratelimit>();
const memoryLimiterCache = new Map<string, { count: number; reset: number }>();

/**
 * Converts a human-readable duration string (e.g. "1 m", "2 h", "30 s") to
 * milliseconds. Used for both the Upstash sliding-window limiter and the
 * in-memory fallback bucket.
 *
 * Returns 60 000 ms (1 minute) for unrecognised formats.
 */
const parseDurationMs = (duration: string): number => {
  const parts = duration.trim().split(/\s+/);
  if (parts.length !== 2) return 60_000;

  const value = parseInt(parts[0] || "60", 10);
  const unit = parts[1]?.toLowerCase();

  switch (unit) {
    case "s":
    case "sec":
    case "second":
    case "seconds":
      return value * 1_000;
    case "m":
    case "min":
    case "minute":
    case "minutes":
      return value * 60_000;
    case "h":
    case "hr":
    case "hour":
    case "hours":
      return value * 3_600_000;
    case "d":
    case "day":
    case "days":
      return value * 86_400_000;
    default:
      return 60_000;
  }
};

/**
 * Converts a duration string to the `${number} ms` literal type that
 * Upstash's Ratelimit.slidingWindow() expects.
 */
const parseDurationForUpstash = (
  duration: string
): `${number} ms` => `${parseDurationMs(duration)} ms` as `${number} ms`;

const getLimiter = (limit: number, window: string) => {
  if (!redis) return null;
  const key = `${limit}:${window}`;
  if (!limiterCache.has(key)) {
    limiterCache.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, parseDurationForUpstash(window)),
        analytics: true,
      })
    );
  }
  return limiterCache.get(key) || null;
};

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp || "unknown";
};

/**
 * Enforces a sliding-window rate limit for the given key + IP pair.
 *
 * - In production with Redis configured: uses Upstash for distributed limiting.
 * - In production without Redis: falls back to an in-process memory bucket
 *   (not shared across serverless instances, but better than nothing).
 * - Outside production: always passes through (returns null) to keep dev ergonomic.
 *
 * Returns a 429 NextResponse if the limit is exceeded, or null if the request is allowed.
 */
export const requireRateLimit = async (options: {
  request: Request;
  key: string;
  limit: number;
  window: string;
}) => {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const limiter = getLimiter(options.limit, options.window);
  const ip = getClientIp(options.request);
  const rateLimitKey = `${options.key}:${ip}`;

  // In-memory fallback when Redis is unavailable.
  if (!limiter) {
    const now = Date.now();
    const windowMs = parseDurationMs(options.window);
    const fallbackKey = `${rateLimitKey}:${options.limit}:${options.window}`;

    const existing = memoryLimiterCache.get(fallbackKey);
    const bucket =
      existing && existing.reset > now
        ? existing
        : { count: 0, reset: now + windowMs };

    bucket.count += 1;
    memoryLimiterCache.set(fallbackKey, bucket);

    // Opportunistic cleanup to avoid unbounded memory growth.
    if (memoryLimiterCache.size > 10_000) {
      for (const [key, value] of memoryLimiterCache) {
        if (value.reset <= now) {
          memoryLimiterCache.delete(key);
        }
      }
    }

    if (bucket.count <= options.limit) return null;

    const retryAfter = Math.max(1, Math.ceil((bucket.reset - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": retryAfter.toString() },
      }
    );
  }

  const result = await limiter.limit(rateLimitKey);

  if (result.success) return null;

  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": retryAfter.toString() },
    }
  );
};
