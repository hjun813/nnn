import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listJobs } from "@/features/jobs/service";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { view } = await searchParams;
  const allJobs = await listJobs(session.user.id);
  const jobs = allJobs.filter((job) => view === "archived" ? job.status === "ARCHIVED" : job.status !== "ARCHIVED");
  return <main className="content-page"><div className="content-top"><div><Link className="back-link" href="/dashboard">← Dashboard</Link><p className="eyebrow">Applications</p><h1>{view === "archived" ? "보관한 공고" : "전체 지원"}</h1></div><Link className="add-button" href="/applications/new">+ 공고 추가</Link></div><nav className="filter-tabs" aria-label="공고 보기"><Link aria-current={view !== "archived" ? "page" : undefined} href="/applications">진행 목록</Link><Link aria-current={view === "archived" ? "page" : undefined} href="/applications?view=archived">보관함</Link></nav><div className="job-list">{jobs.length === 0 && <div className="empty-state"><strong>{view === "archived" ? "보관한 공고가 없습니다." : "등록한 공고가 없습니다."}</strong></div>}{jobs.map((job) => <Link className="job-row" href={`/applications/${job.id}`} key={job.id}><div><strong>{job.companyName}</strong><p>{job.positionTitle}</p></div><span className={`status status-${job.status.toLowerCase()}`}>{job.status.replace("_", " ")}</span><small>{job.applicationTasks.filter((task) => task.status === "DONE").length}/{job.applicationTasks.filter((task) => task.isRequired && task.status !== "NOT_REQUIRED").length} 완료</small></Link>)}</div></main>;
}
