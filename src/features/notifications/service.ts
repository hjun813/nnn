import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { jobPostings, notifications } from "@/db/schema";

const offsetKinds = { 7: "DEADLINE_D7", 3: "DEADLINE_D3", 1: "DEADLINE_D1" } as const;

export function daysUntil(deadline: Date, now: Date) {
  const deadlineDay = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((deadlineDay - today) / 86_400_000);
}

export function notificationKindFor(deadline: Date, now: Date) {
  return offsetKinds[daysUntil(deadline, now) as keyof typeof offsetKinds] ?? null;
}

export async function generateDeadlineNotifications(now = new Date()) {
  const jobs = await getDb().select().from(jobPostings).where(and(inArray(jobPostings.status, ["SAVED", "IN_PROGRESS"]), isNull(jobPostings.archivedAt)));
  const triggerDate = now.toISOString().slice(0, 10);
  const values = jobs.flatMap((job) => {
    if (!job.actualDeadline) return [];
    const kind = notificationKindFor(job.actualDeadline, now);
    return kind ? [{ userId: job.userId, jobPostingId: job.id, kind, triggerDate }] : [];
  });
  if (values.length === 0) return [];
  return getDb().insert(notifications).values(values).onConflictDoNothing().returning({ id: notifications.id });
}

export async function listNotifications(userId: string) {
  return getDb().query.notifications.findMany({ where: eq(notifications.userId, userId), with: { jobPosting: true }, orderBy: [desc(notifications.createdAt)], limit: 100 });
}

export async function markNotificationRead(userId: string, id: string) {
  const [item] = await getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, userId))).returning();
  return item;
}

export async function markAllNotificationsRead(userId: string) {
  return getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, userId), isNull(notifications.readAt))).returning({ id: notifications.id });
}
