"use client";

import { useRouter } from "next/navigation";

export function NotificationActions() {
  const router = useRouter();
  return <button className="secondary-button" type="button" onClick={async () => { await fetch("/api/notifications", { method: "POST" }); router.refresh(); }}>모두 읽음</button>;
}
