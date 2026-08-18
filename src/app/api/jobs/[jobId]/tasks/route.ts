import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { applicationTasks, jobPostings } from "@/db/schema";
import { taskInputSchema } from "@/features/jobs/schemas";
import { apiError, requireApiUser } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const parsed = taskInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "작업 입력값을 확인해주세요.", parsed.error.flatten().fieldErrors);
  const { jobId } = await params;
  const [owned] = await getDb().select({ id: jobPostings.id }).from(jobPostings).where(and(eq(jobPostings.id, jobId), eq(jobPostings.userId, userId))).limit(1);
  if (!owned) return apiError(404, "NOT_FOUND", "공고를 찾을 수 없습니다.");
  const [task] = await getDb().insert(applicationTasks).values({ ...parsed.data, jobPostingId: jobId }).returning();
  return NextResponse.json({ task }, { status: 201 });
}
