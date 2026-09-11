import Redis from "ioredis";

const redis = new Redis(process.env.AIVEN_REDIS_URI!);

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export async function createRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
) {
  const key = `ratelimit:${identifier}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    success: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
  };
}
