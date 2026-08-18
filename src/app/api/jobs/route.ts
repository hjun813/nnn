import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/api";
import { createJobSchema } from "@/features/jobs/schemas";
import { createJob, listJobs } from "@/features/jobs/service";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  return NextResponse.json({ jobs: await listJobs(userId) });
}

export async function POST(request: Request) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const parsed = createJobSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError(400, "VALIDATION_ERROR", "입력값을 확인해주세요.", parsed.error.flatten().fieldErrors);
  try {
    return NextResponse.json({ job: await createJob(userId, parsed.data) }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") return apiError(409, "DUPLICATE_URL", "이미 저장한 공고 URL입니다.");
    console.error("job_create_failed", error);
    return apiError(500, "INTERNAL_ERROR", "공고를 저장하지 못했습니다.");
  }
}
