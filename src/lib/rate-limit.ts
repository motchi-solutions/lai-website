import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isProduction = process.env.NODE_ENV === "production";
const localAttempts = new Map<string, { count: number; reset: number }>();
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;
const limiter = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "15 m"),
          analytics: true,
          prefix: "lai:contact",
      })
    : null;

export async function checkContactRateLimit(identifier: string) {
    if (limiter) return limiter.limit(identifier);
    if (isProduction) throw new Error("Durable rate limiting is not configured.");

    const now = Date.now();
    const current = localAttempts.get(identifier);
    const attempt = !current || current.reset <= now
        ? { count: 1, reset: now + 900_000 }
        : { count: current.count + 1, reset: current.reset };
    localAttempts.set(identifier, attempt);

    return {
        success: attempt.count <= 5,
        limit: 5,
        remaining: Math.max(0, 5 - attempt.count),
        reset: attempt.reset,
        pending: Promise.resolve(),
    };
}
