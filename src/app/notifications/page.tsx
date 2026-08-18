import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NotificationActions } from "@/components/notification-actions";
import { NotificationLink } from "@/components/notification-link";
import { listNotifications } from "@/features/notifications/service";

export const dynamic = "force-dynamic";

const labels = { DEADLINE_D7: "마감 7일 전", DEADLINE_D3: "마감 3일 전", DEADLINE_D1: "마감 하루 전" } as const;

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const items = await listNotifications(session.user.id);
  return <main className="content-page"><div className="content-top"><div><Link className="back-link" href="/dashboard">← Dashboard</Link><p className="eyebrow">Notifications</p><h1>알림</h1></div>{items.some((item) => !item.readAt) && <NotificationActions />}</div><div className="notification-list">{items.length === 0 && <div className="empty-state"><strong>새로운 알림이 없습니다.</strong><p>마감 7일, 3일, 1일 전에 알려드릴게요.</p></div>}{items.map((item) => <NotificationLink id={item.id} jobId={item.jobPostingId} read={Boolean(item.readAt)} key={item.id}><span className="notification-dot" /><div><strong>{item.jobPosting.companyName} · {item.jobPosting.positionTitle}</strong><p>{labels[item.kind]}입니다. 미완료 준비 항목을 확인하세요.</p></div><time>{item.triggerDate}</time></NotificationLink>)}</div></main>;
}
