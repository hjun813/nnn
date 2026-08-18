"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function DeleteAccountButton() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm("계정과 모든 공고, 준비 작업, 알림을 영구 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    setPending(true);
    setError("");
    const response = await fetch("/api/account", { method: "DELETE" });
    if (!response.ok) { setError("계정을 삭제하지 못했습니다."); setPending(false); return; }
    await signOut({ callbackUrl: "/register" });
  }

  return <div><button className="text-button danger" type="button" disabled={pending} onClick={remove}>{pending ? "삭제 중…" : "계정과 데이터 영구 삭제"}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
