import { NextResponse } from "next/server";
import { markNotificationRead } from "@/features/notifications/service";
import { apiError, requireApiUser } from "@/lib/api";

export async function POST(_: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const { notificationId } = await params;
  const notification = await markNotificationRead(userId, notificationId);
  return notification ? NextResponse.json({ notification }) : apiError(404, "NOT_FOUND", "알림을 찾을 수 없습니다.");
}
