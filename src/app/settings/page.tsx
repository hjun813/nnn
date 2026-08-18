import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteAccountButton } from "@/components/delete-account-button";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <main className="content-page"><Link className="back-link" href="/dashboard">← Dashboard</Link><p className="eyebrow">Settings</p><h1>설정</h1><div className="settings-list"><section className="detail-card"><h2>계정</h2><dl><dt>이메일</dt><dd>{session.user.email}</dd></dl></section><section className="detail-card danger-zone"><h2>데이터 삭제</h2><p>계정을 삭제하면 공고, 작업, 알림을 포함한 모든 데이터가 함께 삭제됩니다.</p><DeleteAccountButton /></section></div></main>;
}
