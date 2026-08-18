import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { applicationTasks, jobPostings } from "@/db/schema";
import { updateTaskSchema } from "@/features/jobs/schemas";
import { apiError, requireApiUser } from "@/lib/api";

async function isOwned(userId: string, jobId: string) {
  const [job] = await getDb().select({ id: jobPostings.id }).from(jobPostings).where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId))).limit(1);
  return Boolean(job);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string; taskId: string }> }) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const parsed = updateTaskSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "작업 입력값을 확인해주세요.");
  const { jobId, taskId } = await params;
  if (!(await isOwned(userId, jobId))) return apiError(404, "NOT_FOUND", "작업을 찾을 수 없습니다.");
  const { version, ...values } = parsed.data;
  void version;
  const [task] = await getDb().update(applicationTasks).set({ ...values, updatedAt: new Date() }).where(and(eq(applicationTasks.id, taskId), eq(applicationTasks.jobPostingId, jobId))).returning();
  return task ? NextResponse.json({ task }) : apiError(404, "NOT_FOUND", "작업을 찾을 수 없습니다.");
}

export async function DELETE(_: Request, { params }: { params: Promise<{ jobId: string; taskId: string }> }) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const { jobId, taskId } = await params;
  if (!(await isOwned(userId, jobId))) return apiError(404, "NOT_FOUND", "작업을 찾을 수 없습니다.");
  const [task] = await getDb().delete(applicationTasks).where(and(eq(applicationTasks.id, taskId), eq(applicationTasks.jobPostingId, jobId))).returning({ id: applicationTasks.id });
  return task ? new NextResponse(null, { status: 204 }) : apiError(404, "NOT_FOUND", "작업을 찾을 수 없습니다.");
}
