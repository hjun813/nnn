"use client";

import Link from "next/link";

export function NotificationLink({ id, jobId, read, children }: { id: string; jobId: string; read: boolean; children: React.ReactNode }) {
  return <Link className={`notification-row ${read ? "read" : ""}`} href={`/applications/${jobId}`} onClick={() => { if (!read) void fetch(`/api/notifications/${id}/read`, { method: "POST", keepalive: true }); }}>{children}</Link>;
}
