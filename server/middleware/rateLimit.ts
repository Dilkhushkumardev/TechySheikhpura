import type { ServerResponse } from 'node:http';
import { getServerConfig } from '../config/env.ts';

interface BucketEntry {
  timestamps: number[];
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowLimiter {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    const cutoff = now - this.windowMs;
    const existing = this.buckets.get(key);
    const recent = existing ? existing.timestamps.filter((t) => t > cutoff) : [];

    if (recent.length >= this.maxRequests) {
      const oldest = recent[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));
      this.buckets.set(key, { timestamps: recent });
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    recent.push(now);
    this.buckets.set(key, { timestamps: recent });

    // Bound memory growth if many distinct keys pass through
    if (this.buckets.size > 5000) {
      for (const [k, entry] of this.buckets) {
        if (entry.timestamps.every((t) => t <= cutoff)) {
          this.buckets.delete(k);
        }
      }
    }

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: Math.max(0, this.maxRequests - recent.length),
      retryAfterSeconds: 0,
    };
  }

  reset(): void {
    this.buckets.clear();
  }
}

const generalApiLimiter = new SlidingWindowLimiter(60 * 1000, 240);
const writeMutationLimiter = new SlidingWindowLimiter(15 * 60 * 1000, 40);
const adminAuthLimiter = new SlidingWindowLimiter(15 * 60 * 1000, 15);

export function enforceRateLimit(
  clientIp: string,
  method: string,
  pathname: string,
  res: ServerResponse
): RateLimitResult {
  if (getServerConfig().rateLimitDisabled) {
    return { allowed: true, limit: 9999, remaining: 9999, retryAfterSeconds: 0 };
  }

  let limiter = generalApiLimiter;
  let bucketPrefix = 'general';

  if (pathname === '/api/admin/auth' && method === 'POST') {
    limiter = adminAuthLimiter;
    bucketPrefix = 'admin-auth';
  } else if (
    method === 'POST' &&
    (pathname === '/api/registrations' || pathname === '/api/inquiries')
  ) {
    limiter = writeMutationLimiter;
    bucketPrefix = 'public-write';
  }

  const result = limiter.consume(`${bucketPrefix}:${clientIp}`);
  res.setHeader('X-RateLimit-Limit', String(result.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfterSeconds));
  }
  return result;
}

export function resetAllRateLimiters(): void {
  generalApiLimiter.reset();
  writeMutationLimiter.reset();
  adminAuthLimiter.reset();
}

