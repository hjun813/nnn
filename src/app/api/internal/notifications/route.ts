import { NextResponse } from "next/server";
import { generateDeadlineNotifications } from "@/features/notifications/service";
import { apiError } from "@/lib/api";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return apiError(401, "UNAUTHORIZED", "유효한 작업 인증이 필요합니다.");
  const created = await generateDeadlineNotifications();
  return NextResponse.json({ createdCount: created.length });
}
