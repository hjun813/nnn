import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage() {
  if (await auth()) redirect("/dashboard");
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand dark">Apply<span>Flow</span></div>
        <p className="eyebrow">Welcome back</p>
        <h1>지원 흐름을<br />다시 이어가세요.</h1>
        <AuthForm mode="login" />
        <p className="auth-switch">처음이신가요? <Link href="/register">계정 만들기</Link></p>
      </section>
    </main>
  );
}
