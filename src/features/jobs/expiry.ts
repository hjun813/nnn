import { and, inArray, isNotNull, lt, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { jobPostings } from "@/db/schema";
import type { ApplicationStatus } from "@/domain/application";

export function shouldExpire(status: ApplicationStatus, actualDeadline: Date | null, now: Date): boolean {
  return (status === "SAVED" || status === "IN_PROGRESS") && actualDeadline !== null && actualDeadline < now;
}

export async function expireDueJobs(now = new Date()) {
  return getDb().update(jobPostings).set({
    statusBeforeExpiry: sql`${jobPostings.status}`,
    status: "EXPIRED",
    updatedAt: now,
    version: sql`${jobPostings.version} + 1`,
  }).where(and(
    inArray(jobPostings.status, ["SAVED", "IN_PROGRESS"]),
    isNotNull(jobPostings.actualDeadline),
    lt(jobPostings.actualDeadline, now),
  )).returning({ id: jobPostings.id });
}
