import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// Make KV optional for local development/testing
const hasKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

let redis: Redis | null = null;
if (hasKV) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
} else {
  console.warn(
    "[rate-limit] KV_REST_API_URL and KV_REST_API_TOKEN not set. Rate limiting disabled. Set these env vars to enable rate limiting.",
  );
}

// Create a no-op rate limiter when KV is not available
const noOpLimiter = {
  limit: async () => ({ success: true, limit: Infinity, remaining: Infinity, reset: Date.now() }),
};

export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    })
  : (noOpLimiter as any);

export const signUpRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "15 m"),
      analytics: true,
      prefix: "ratelimit:signup",
    })
  : (noOpLimiter as any);
