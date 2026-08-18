"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="state-page"><p className="eyebrow">Something went wrong</p><h1>요청을 처리하지 못했습니다.</h1><p className="intro">잠시 후 다시 시도해주세요. 입력한 내용은 가능한 한 유지됩니다.</p><button className="add-button" onClick={reset}>다시 시도</button></main>;
}
