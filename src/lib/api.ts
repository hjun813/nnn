import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireApiUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function apiError(status: number, code: string, message: string, fields?: unknown) {
  return NextResponse.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}
