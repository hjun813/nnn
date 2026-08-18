import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { jobPostings } from "@/db/schema";
import { getJob } from "@/features/jobs/service";
import { updateJobSchema } from "@/features/jobs/schemas";
import { normalizeJobUrl } from "@/features/jobs/url";
import { apiError, requireApiUser } from "@/lib/api";

type Context = { params: Promise<{ jobId: string }> };

export async function GET(_: Request, { params }: Context) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const { jobId } = await params;
  const job = await getJob(userId, jobId);
  return job ? NextResponse.json({ job }) : apiError(404, "NOT_FOUND", "공고를 찾을 수 없습니다.");
}

export async function PATCH(request: Request, { params }: Context) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const parsed = updateJobSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "입력값을 확인해주세요.", parsed.error.flatten().fieldErrors);
  const { jobId } = await params;
  const { version, sourceUrl, ...values } = parsed.data;
  const [updated] = await getDb().update(jobPostings).set({ ...values, ...(sourceUrl !== undefined ? { sourceUrl, normalizedUrl: normalizeJobUrl(sourceUrl) } : {}), updatedAt: new Date(), version: version + 1 }).where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId), eq(jobPostings.version, version))).returning();
  return updated ? NextResponse.json({ job: updated }) : apiError(409, "VERSION_CONFLICT", "다른 변경사항이 먼저 저장되었습니다.");
}

export async function DELETE(_: Request, { params }: Context) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const { jobId } = await params;
  const [deleted] = await getDb().delete(jobPostings).where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId))).returning({ id: jobPostings.id });
  return deleted ? new NextResponse(null, { status: 204 }) : apiError(404, "NOT_FOUND", "공고를 찾을 수 없습니다.");
}
