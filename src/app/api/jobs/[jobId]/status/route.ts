import { NextResponse } from "next/server";
import { updateStatusSchema } from "@/features/jobs/schemas";
import { setJobStatus } from "@/features/jobs/service";
import { apiError, requireApiUser } from "@/lib/api";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const parsed = updateStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "지원 상태를 확인해주세요.");
  const { jobId } = await params;
  const job = await setJobStatus(userId, jobId, parsed.data.status);
  return job ? NextResponse.json({ job }) : apiError(404, "NOT_FOUND", "공고를 찾을 수 없습니다.");
}
