"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Task { id: string; title: string; status: "TODO" | "IN_PROGRESS" | "DONE" | "NOT_REQUIRED" }

export function TaskChecklist({ jobId, tasks }: { jobId: string; tasks: Task[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string>();

  async function toggle(task: Task) {
    setPendingId(task.id);
    await fetch(`/api/jobs/${jobId}/tasks/${task.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: task.status === "DONE" ? "TODO" : "DONE" }) });
    setPendingId(undefined);
    router.refresh();
  }

  return <div className="task-list">{tasks.map((task) => <label className="task-item" key={task.id}><input type="checkbox" checked={task.status === "DONE"} disabled={pendingId === task.id} onChange={() => toggle(task)} /><span>{task.title}</span><small>{task.status === "DONE" ? "완료" : task.status === "IN_PROGRESS" ? "진행 중" : "미완료"}</small></label>)}</div>;
}
