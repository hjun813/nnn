"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const defaultTasks = [
  { type: "RESUME", title: "이력서" },
  { type: "PORTFOLIO", title: "포트폴리오" },
  { type: "ESSAY", title: "자기소개서" },
] as const;

export function JobForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const deadlineType = String(form.get("deadlineType"));
    const toIso = (name: string) => {
      const value = String(form.get(name) ?? "");
      return value ? new Date(value).toISOString() : null;
    };
    const selectedTasks = defaultTasks.filter((task) => form.get(`task-${task.type}`) === "on");
    const body = {
      companyName: form.get("companyName"),
      positionTitle: form.get("positionTitle"),
      sourceUrl: form.get("sourceUrl"),
      deadlineType,
      actualDeadline: deadlineType === "FIXED" ? toIso("actualDeadline") : null,
      targetDeadline: deadlineType === "FIXED" ? toIso("targetDeadline") : null,
      memo: form.get("memo"),
      tasks: selectedTasks.map((task, sortOrder) => ({ ...task, status: "TODO", isRequired: true, sortOrder })),
    };

    try {
      const response = await fetch("/api/jobs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message ?? "공고를 저장하지 못했습니다.");
      router.push(`/applications/${data.job.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "공고를 저장하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="job-form" onSubmit={submit}>
      <div className="form-grid">
        <label>회사명 *<input name="companyName" maxLength={100} required /></label>
        <label>직무명 *<input name="positionTitle" maxLength={150} required /></label>
      </div>
      <label>공고 URL<input name="sourceUrl" type="url" placeholder="https://..." /></label>
      <div className="form-grid">
        <label>마감 유형<select name="deadlineType" defaultValue="FIXED"><option value="FIXED">날짜 지정</option><option value="ALWAYS_OPEN">상시 채용</option><option value="UNKNOWN">미정</option></select></label>
        <label>실제 마감<input name="actualDeadline" type="datetime-local" /></label>
        <label>내 목표일<input name="targetDeadline" type="datetime-local" /></label>
      </div>
      <fieldset><legend>필요 제출물</legend><div className="check-row">{defaultTasks.map((task) => <label key={task.type}><input name={`task-${task.type}`} type="checkbox" defaultChecked /> {task.title}</label>)}</div></fieldset>
      <label>메모<textarea name="memo" maxLength={2000} rows={4} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button type="button" className="secondary-button" onClick={() => router.back()}>취소</button><button type="submit" className="add-button" disabled={pending}>{pending ? "저장 중…" : "공고 저장"}</button></div>
    </form>
  );
}
