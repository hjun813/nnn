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

  async function remove() {
    if (!window.confirm("이 공고와 모든 준비 작업을 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    setError("");
    const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    if (!response.ok) { setError("공고를 삭제하지 못했습니다."); return; }
    router.push("/applications");
    router.refresh();
  }

  return <div className="status-actions">
    {(status === "ARCHIVED" || status === "EXPIRED") && <button disabled={Boolean(pending)} className="secondary-button" onClick={() => update("SAVED")}>진행 목록으로 복원</button>}
    {status === "APPLIED" && <button disabled={Boolean(pending)} className="secondary-button" onClick={() => update("IN_PROGRESS")}>지원 완료 취소</button>}
    {status !== "IN_PROGRESS" && status !== "APPLIED" && status !== "ARCHIVED" && status !== "EXPIRED" && <button disabled={Boolean(pending)} className="secondary-button" onClick={() => update("IN_PROGRESS")}>준비 시작</button>}
    {status !== "APPLIED" && <button disabled={Boolean(pending)} className="add-button" onClick={() => update("APPLIED")}>지원 완료</button>}
    {status !== "ARCHIVED" && status !== "EXPIRED" && <button disabled={Boolean(pending)} className="text-button" onClick={() => update("ARCHIVED")}>보관</button>}
    <button className="text-button danger" type="button" onClick={remove}>영구 삭제</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
