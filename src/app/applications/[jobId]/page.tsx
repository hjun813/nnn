import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { TaskChecklist } from "@/components/task-checklist";
import { getJob } from "@/features/jobs/service";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { jobId } = await params;
  const job = await getJob(session.user.id, jobId);
  if (!job) notFound();
  const date = job.actualDeadline ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short" }).format(job.actualDeadline) : job.deadlineType === "ALWAYS_OPEN" ? "상시 채용" : "미정";
  return <main className="content-page"><Link className="back-link" href="/applications">← 전체 지원</Link><header className="detail-header"><div><p className="eyebrow">{job.status.replace("_", " ")}</p><h1>{job.companyName}</h1><p className="intro">{job.positionTitle}</p></div>{job.sourceUrl && <a className="secondary-button" href={job.sourceUrl} target="_blank" rel="noreferrer">공고 확인 ↗</a>}</header><div className="detail-grid"><section className="detail-card"><h2>일정</h2><dl><dt>실제 마감</dt><dd>{date}</dd><dt>내 목표일</dt><dd>{job.targetDeadline ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeStyle: "short" }).format(job.targetDeadline) : "설정하지 않음"}</dd></dl></section><section className="detail-card"><h2>준비 상황</h2><TaskChecklist jobId={job.id} tasks={job.applicationTasks} /></section></div>{job.memo && <section className="detail-card memo"><h2>메모</h2><p>{job.memo}</p></section>}</main>;
}
