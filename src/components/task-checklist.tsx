"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface Task { id: string; title: string; status: "TODO" | "IN_PROGRESS" | "DONE" | "NOT_REQUIRED" }

export function TaskChecklist({ jobId, tasks }: { jobId: string; tasks: Task[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();
  const [error, setError] = useState("");

  async function update(task: Task, status: Task["status"]) {
    setPendingId(task.id);
    setError("");
    const response = await fetch(`/api/jobs/${jobId}/tasks/${task.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) setError("작업 상태를 변경하지 못했습니다.");
    setPendingId(undefined);
    router.refresh();
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPendingId("new");
    setError("");
    const response = await fetch(`/api/jobs/${jobId}/tasks`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: data.get("type"), title: data.get("title"), status: "TODO", isRequired: true, sortOrder: tasks.length }) });
    if (response.ok) form.reset(); else setError("작업을 추가하지 못했습니다.");
    setPendingId(undefined);
    router.refresh();
  }

  async function remove(task: Task) {
    if (!window.confirm(`‘${task.title}’ 작업을 삭제할까요?`)) return;
    setPendingId(task.id);
    const response = await fetch(`/api/jobs/${jobId}/tasks/${task.id}`, { method: "DELETE" });
    if (!response.ok) setError("작업을 삭제하지 못했습니다.");
    setPendingId(undefined);
    router.refresh();
  }

  return <div className="task-list">
    {tasks.map((task) => <div className="task-item" key={task.id}><input aria-label={`${task.title} 완료`} type="checkbox" checked={task.status === "DONE"} disabled={pendingId === task.id} onChange={() => update(task, task.status === "DONE" ? "TODO" : "DONE")} /><span>{task.title}</span><select aria-label={`${task.title} 상태`} value={task.status} disabled={pendingId === task.id} onChange={(event) => update(task, event.target.value as Task["status"])}><option value="TODO">미완료</option><option value="IN_PROGRESS">진행 중</option><option value="DONE">완료</option><option value="NOT_REQUIRED">불필요</option></select><button className="icon-button" type="button" aria-label={`${task.title} 삭제`} onClick={() => remove(task)}>×</button></div>)}
    <form className="task-add" onSubmit={add}><select name="type" aria-label="작업 종류" defaultValue="CUSTOM"><option value="CUSTOM">직접 입력</option><option value="RESUME">이력서</option><option value="PORTFOLIO">포트폴리오</option><option value="ESSAY">자기소개서</option><option value="ASSIGNMENT">사전 과제</option><option value="CODING_TEST">코딩테스트</option></select><input name="title" aria-label="작업 이름" placeholder="새 준비 작업" maxLength={100} required /><button className="secondary-button" disabled={pendingId === "new"}>추가</button></form>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
