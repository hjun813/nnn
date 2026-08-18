"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "SAVED" | "IN_PROGRESS" | "APPLIED" | "ARCHIVED";

export function JobStatusActions({ jobId, status }: { jobId: string; status: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Status>();
  const [error, setError] = useState("");

  async function update(nextStatus: Status) {
    if (nextStatus === "APPLIED" && !window.confirm("외부 채용 사이트에서 지원을 완료했나요?")) return;
    if (nextStatus === "ARCHIVED" && !window.confirm("이 공고를 보관할까요? 목록 필터에서 다시 찾을 수 있습니다.")) return;
    setPending(nextStatus);
    setError("");
    const response = await fetch(`/api/jobs/${jobId}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error?.message ?? "상태를 변경하지 못했습니다.");
      setPending(undefined);
      return;
    }
    if (nextStatus === "ARCHIVED") router.push("/applications");
    router.refresh();
    setPending(undefined);
  }

  return <div className="status-actions">
    {status !== "IN_PROGRESS" && status !== "APPLIED" && <button disabled={Boolean(pending)} className="secondary-button" onClick={() => update("IN_PROGRESS")}>준비 시작</button>}
    {status !== "APPLIED" && <button disabled={Boolean(pending)} className="add-button" onClick={() => update("APPLIED")}>지원 완료</button>}
    {status !== "ARCHIVED" && <button disabled={Boolean(pending)} className="text-button danger" onClick={() => update("ARCHIVED")}>보관</button>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
