import { NextResponse } from "next/server";
import { expireDueJobs } from "@/features/jobs/expiry";
import { generateDeadlineNotifications } from "@/features/notifications/service";
import { apiError } from "@/lib/api";
import { deleteExpiredRateLimits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return apiError(401, "UNAUTHORIZED", "유효한 작업 인증이 필요합니다.");
  }

  const expired = await expireDueJobs();
  const notifications = await generateDeadlineNotifications();
  const deletedRateLimits = await deleteExpiredRateLimits();
  return NextResponse.json({
    expiredCount: expired.length,
    createdNotificationCount: notifications.length,
    deletedRateLimitCount: deletedRateLimits,
  });
}
