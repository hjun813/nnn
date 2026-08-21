import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { consumeRateLimit, getRequestIp } from "@/lib/rate-limit";

const registrationSchema = z.object({
  email: z.string().trim().toLowerCase().email("올바른 이메일을 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(128),
});

export async function POST(request: Request) {
  const rateLimit = await consumeRateLimit({
    action: "register",
    identifier: getRequestIp(request),
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요." } },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message } }, { status: 400 });
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const [user] = await getDb().insert(users).values({ email: parsed.data.email, passwordHash }).returning({ id: users.id, email: users.email });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: { code: "EMAIL_EXISTS", message: "이미 가입된 이메일입니다." } }, { status: 409 });
    }
    console.error("registration_failed", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "가입 처리 중 오류가 발생했습니다." } }, { status: 500 });
  }
}
