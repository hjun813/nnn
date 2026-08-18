import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage() {
  if (await auth()) redirect("/dashboard");
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand dark">Apply<span>Flow</span></div>
        <p className="eyebrow">ApplyFlow 시작하기</p>
        <h1>발견한 기회를<br />지원까지 연결해요</h1>
        <AuthForm mode="register" />
        <p className="auth-switch">이미 계정이 있나요? <Link href="/login">로그인</Link></p>
      </section>
    </main>
  );
}
