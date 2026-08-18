import { NextResponse } from "next/server";
import { listNotifications, markAllNotificationsRead } from "@/features/notifications/service";
import { apiError, requireApiUser } from "@/lib/api";

export async function GET() {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  return NextResponse.json({ notifications: await listNotifications(userId) });
}

export async function POST() {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const updated = await markAllNotificationsRead(userId);
  return NextResponse.json({ updatedCount: updated.length });
}
