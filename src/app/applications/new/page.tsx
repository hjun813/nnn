import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { JobForm } from "@/components/job-form";

export default async function NewApplicationPage() {
  if (!(await auth())?.user?.id) redirect("/login");
  return <main className="content-page"><Link className="back-link" href="/dashboard">← Dashboard</Link><header><p className="eyebrow">New application</p><h1>공고 직접 등록</h1><p className="intro">필수 정보만 먼저 저장하고 나중에 보완할 수 있어요.</p></header><JobForm /></main>;
}
