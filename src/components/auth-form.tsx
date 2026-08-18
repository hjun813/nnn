"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "register") {
        const response = await fetch("/api/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message ?? "가입하지 못했습니다.");
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("이메일 또는 비밀번호를 확인해주세요.");
      router.push("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "요청을 처리하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label>이메일<input name="email" type="email" autoComplete="email" required /></label>
      <label>비밀번호<input name="password" type="password" minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="add-button" type="submit" disabled={pending}>{pending ? "처리 중…" : mode === "login" ? "로그인" : "계정 만들기"}</button>
    </form>
  );
}
