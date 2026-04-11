/**
 * In-memory rate limiter for API routes.
 * Uses a sliding-window counter per IP/key.
 *
 * Usage in route handlers:
 *   import { rateLimit } from "@/lib/rateLimit";
 *   const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500, limit: 10 });
 *
 *   // Inside handler:
 *   const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
 *   const { success } = await limiter.check(ip);
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitOptions {
  /** Window size in milliseconds (default: 60 000 = 1 min) */
  interval?: number;
  /** Max unique tokens tracked per window (to cap memory; default: 500) */
  uniqueTokenPerInterval?: number;
  /** Max requests per token per window */
  limit: number;
}

interface TokenBucket {
  count: number;
  expiresAt: number;
}

export function rateLimit(opts: RateLimitOptions) {
  const interval = opts.interval ?? 60_000;
  const maxTokens = opts.uniqueTokenPerInterval ?? 500;
  const limit = opts.limit;

  const tokenCache = new Map<string, TokenBucket>();

  // Periodically clean up expired entries (every 30s)
  let cleanupTimer: ReturnType<typeof setInterval> | null = null;

  function ensureCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, bucket] of tokenCache) {
        if (bucket.expiresAt <= now) {
          tokenCache.delete(key);
        }
      }
      // If cache is empty, stop the timer
      if (tokenCache.size === 0 && cleanupTimer) {
        clearInterval(cleanupTimer);
        cleanupTimer = null;
      }
    }, 30_000);
    // Allow Node to exit even if timer is running
    if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
      cleanupTimer.unref();
    }
  }

  return {
    check(token: string): { success: boolean; remaining: number; resetAt: number } {
      ensureCleanup();

      const now = Date.now();
      const existing = tokenCache.get(token);

      // If expired or doesn't exist, create new bucket
      if (!existing || existing.expiresAt <= now) {
        // Enforce max token limit — evict oldest if necessary
        if (tokenCache.size >= maxTokens) {
          const firstKey = tokenCache.keys().next().value;
          if (firstKey) tokenCache.delete(firstKey);
        }

        tokenCache.set(token, { count: 1, expiresAt: now + interval });
        return { success: true, remaining: limit - 1, resetAt: now + interval };
      }

      // Bucket exists and is still valid
      existing.count += 1;

      if (existing.count > limit) {
        return { success: false, remaining: 0, resetAt: existing.expiresAt };
      }

      return {
        success: true,
        remaining: limit - existing.count,
        resetAt: existing.expiresAt,
      };
    },
  };
}
