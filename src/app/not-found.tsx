import Link from "next/link";

export default function NotFound() {
  return <main className="state-page"><p className="eyebrow">404</p><h1>페이지를 찾을 수 없습니다.</h1><p className="intro">삭제되었거나 접근 권한이 없는 공고일 수 있습니다.</p><Link className="add-button" href="/dashboard">Dashboard로 이동</Link></main>;
}
