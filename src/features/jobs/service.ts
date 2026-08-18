import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { applicationTasks, jobPostings, statusHistory } from "@/db/schema";
import type { CreateJobInput } from "./schemas";
import { normalizeJobUrl } from "./url";

export async function listJobs(userId: string) {
  return getDb().query.jobPostings.findMany({ where: eq(jobPostings.userId, userId), with: { applicationTasks: true }, orderBy: (jobs, { asc }) => [asc(jobs.targetDeadline), asc(jobs.actualDeadline)] });
}

export async function getJob(userId: string, jobId: string) {
  return getDb().query.jobPostings.findFirst({ where: and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId)), with: { applicationTasks: true, essayQuestions: true } });
}

export async function createJob(userId: string, input: CreateJobInput) {
  return getDb().transaction(async (tx) => {
    const [job] = await tx.insert(jobPostings).values({
      userId,
      companyName: input.companyName,
      positionTitle: input.positionTitle,
      sourceUrl: input.sourceUrl,
      normalizedUrl: normalizeJobUrl(input.sourceUrl),
      platform: input.platform,
      deadlineType: input.deadlineType,
      actualDeadline: input.actualDeadline,
      targetDeadline: input.targetDeadline,
      memo: input.memo,
    }).returning();
    if (input.tasks.length) await tx.insert(applicationTasks).values(input.tasks.map((task) => ({ ...task, jobPostingId: job.id })));
    return job;
  });
}

export async function setJobStatus(userId: string, jobId: string, nextStatus: "SAVED" | "IN_PROGRESS" | "APPLIED" | "ARCHIVED") {
  return getDb().transaction(async (tx) => {
    const [current] = await tx.select().from(jobPostings).where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId))).limit(1);
    if (!current) return null;
    const [updated] = await tx.update(jobPostings).set({ status: nextStatus, appliedAt: nextStatus === "APPLIED" ? new Date() : current.appliedAt, archivedAt: nextStatus === "ARCHIVED" ? new Date() : null, updatedAt: new Date(), version: current.version + 1 }).where(eq(jobPostings.id, jobId)).returning();
    await tx.insert(statusHistory).values({ jobPostingId: jobId, fromStatus: current.status, toStatus: nextStatus, reason: "USER_ACTION" });
    return updated;
  });
}
