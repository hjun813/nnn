import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { JobEditForm } from "@/components/job-edit-form";
import { getJob } from "@/features/jobs/service";

export const dynamic = "force-dynamic";

export default async function EditApplicationPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { jobId } = await params;
  const job = await getJob(session.user.id, jobId);
  if (!job) notFound();
  return <main className="content-page"><Link className="back-link" href={`/applications/${job.id}`}>← 공고 상세</Link><header><p className="eyebrow">Edit application</p><h1>공고 정보 수정</h1><p className="intro">일정과 기본 정보를 최신 상태로 유지하세요.</p></header><JobEditForm job={job} /></main>;
}
