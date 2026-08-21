import { createHash } from "node:crypto";
import { lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { rateLimits } from "@/db/schema";

type RateLimitOptions = {
  action: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function consumeRateLimit({ action, identifier, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const digest = createHash("sha256").update(identifier).digest("hex");
  const key = `${action}:${windowStart}:${digest}`;
  const expiresAt = new Date(windowStart + windowMs);

  const [bucket] = await getDb()
    .insert(rateLimits)
    .values({ key, expiresAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { count: sql`${rateLimits.count} + 1` },
    })
    .returning({ count: rateLimits.count });

  return {
    allowed: (bucket?.count ?? limit + 1) <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}

export async function deleteExpiredRateLimits(now = new Date()) {
  const deleted = await getDb().delete(rateLimits).where(lt(rateLimits.expiresAt, now)).returning({ key: rateLimits.key });
  return deleted.length;
}
