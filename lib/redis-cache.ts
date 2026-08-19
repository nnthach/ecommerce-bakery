import { redis } from "./redis";

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);

    console.log(`[Redis] ${data ? "HIT" : "MISS"} - ${key}`);

    return data;
  } catch (error) {
    console.error("[Redis] GET error:", error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttl: number,
): Promise<void> {
  try {
    await redis.set(key, data, {
      ex: ttl,
    });

    console.log(`[Redis] SET - ${key}`);
  } catch (error) {
    console.error("[Redis] SET error:", error);
  }
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function deleteCacheByResource(resource: string): Promise<void> {
  try {
    let cursor = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `${resource}:*`,
        count: 100,
      });

      cursor = Number(nextCursor);

      if (keys.length > 0) {
        await redis.del(...keys);

        console.log(`[Redis] DELETE ${keys.length} keys - ${resource}:*`);
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error(`[Redis] DELETE RESOURCE error - ${resource}:*`, error);
  }
}

// generate cache key
export function generateCacheKey(
  resource: string,
  search: string,
  limit: number,
  page: number,
  sortBy: string,
  order: string,
  locale: string,
  isActive: boolean | null,
  isDailyBake: boolean | null,
  categoryId: string | null,
  city: string | null,
  businessDate: string | null,
) {
  search = search.trim() || "none";
  sortBy = sortBy.trim() || "created_at";
  order = order.trim().toLowerCase() || "desc";
  locale = locale.trim() || "vi";

  return `${resource}:${search}:${sortBy}:${order}:${locale}:${page}:${limit}:${isActive}:${isDailyBake}:${categoryId}:${city}:${businessDate}`;
}
