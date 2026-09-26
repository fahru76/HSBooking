/**
 * Lightweight in-memory rate limiter for public booking intake.
 *
 * A sliding-window counter per client IP. No external dependency — sufficient
 * for a single-server Next.js deployment. If the app later runs on multiple
 * instances, swap this for an Upstash/Redis-backed limiter with the same
 * interface.
 *
 * Entries self-expire: stale windows are pruned on each call so the Map
 * cannot grow without bound.
 */

interface Window {
  timestamps: number[];
}

const buckets = new Map<string, Window>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // 5 booking attempts per minute per IP

/** Returns the client IP from a Next.js Request, falling back to "unknown". */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Returns true if the IP is within the allowed request budget.
 * Side-effect: prunes expired timestamps and stale buckets.
 */
export function rateLimit(ip: string, now: number = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;
  const bucket = buckets.get(ip);

  if (!bucket) {
    buckets.set(ip, { timestamps: [now] });
    return true;
  }

  // Drop timestamps outside the sliding window.
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    return false;
  }

  bucket.timestamps.push(now);
  return true;
}

/** Test hook: reset all buckets. */
export function __resetRateLimit(): void {
  buckets.clear();
}
