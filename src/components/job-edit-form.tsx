"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface InitialJob {
  id: string;
  companyName: string;
  positionTitle: string;
  sourceUrl: string | null;
  deadlineType: "FIXED" | "ALWAYS_OPEN" | "UNKNOWN";
  actualDeadline: Date | null;
  targetDeadline: Date | null;
  memo: string | null;
  version: number;
}

const localDateTime = (date: Date | null) => date ? new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "";

export function JobEditForm({ job }: { job: InitialJob }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const deadlineType = String(form.get("deadlineType"));
    const toIso = (name: string) => { const value = String(form.get(name) ?? ""); return value ? new Date(value).toISOString() : null; };
    const response = await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        companyName: form.get("companyName"), positionTitle: form.get("positionTitle"), sourceUrl: form.get("sourceUrl"), deadlineType,
        actualDeadline: deadlineType === "FIXED" ? toIso("actualDeadline") : null,
        targetDeadline: deadlineType === "FIXED" ? toIso("targetDeadline") : null,
        memo: form.get("memo"), version: job.version,
      }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error?.message ?? "수정 내용을 저장하지 못했습니다.");
      setPending(false);
      return;
    }
    router.push(`/applications/${job.id}`);
    router.refresh();
  }

  return <form className="job-form" onSubmit={submit}>
    <div className="form-grid"><label>회사명 *<input name="companyName" defaultValue={job.companyName} required /></label><label>직무명 *<input name="positionTitle" defaultValue={job.positionTitle} required /></label></div>
    <label>공고 URL<input name="sourceUrl" type="url" defaultValue={job.sourceUrl ?? ""} /></label>
    <div className="form-grid"><label>마감 유형<select name="deadlineType" defaultValue={job.deadlineType}><option value="FIXED">날짜 지정</option><option value="ALWAYS_OPEN">상시 채용</option><option value="UNKNOWN">미정</option></select></label><label>실제 마감<input name="actualDeadline" type="datetime-local" defaultValue={localDateTime(job.actualDeadline)} /></label><label>내 목표일<input name="targetDeadline" type="datetime-local" defaultValue={localDateTime(job.targetDeadline)} /></label></div>
    <label>메모<textarea name="memo" maxLength={2000} rows={5} defaultValue={job.memo ?? ""} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-actions"><button className="secondary-button" type="button" onClick={() => router.back()}>취소</button><button className="add-button" type="submit" disabled={pending}>{pending ? "저장 중…" : "수정 저장"}</button></div>
  </form>;
}
