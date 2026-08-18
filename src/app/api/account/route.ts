import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { apiError, requireApiUser } from "@/lib/api";

export async function DELETE() {
  const userId = await requireApiUser();
  if (!userId) return apiError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
  const [deleted] = await getDb().delete(users).where(eq(users.id, userId)).returning({ id: users.id });
  return deleted ? new NextResponse(null, { status: 204 }) : apiError(404, "NOT_FOUND", "계정을 찾을 수 없습니다.");
}
