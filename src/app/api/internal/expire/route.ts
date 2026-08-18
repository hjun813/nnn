import { NextResponse } from "next/server";
import { expireDueJobs } from "@/features/jobs/expiry";
import { apiError } from "@/lib/api";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return apiError(401, "UNAUTHORIZED", "유효한 작업 인증이 필요합니다.");
  }
  const expired = await expireDueJobs();
  return NextResponse.json({ expiredCount: expired.length });
}
