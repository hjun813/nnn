import type { Dashboard } from "@/domain/application";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(value);

export function DashboardShell({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Apply<span>Flow</span></div>
        <nav className="nav" aria-label="주요 메뉴">
          <a href="#today" aria-current="page">Today <small>{dashboard.today.length}</small></a>
          <a href="#applications">Applications</a>
          <a href="#settings">Settings</a>
        </nav>
        <p className="sidebar-note">발견한 기회를 놓치지 않고<br />실제 지원까지 이어가세요.</p>
      </aside>

      <main className="main" id="today">
        <header className="topbar">
          <div>
            <p className="eyebrow">Tuesday · Today</p>
            <h1>가장 중요한 지원부터<br />끝내볼까요?</h1>
            <p className="intro">이번 주 마감 공고가 {dashboard.thisWeek.length}개 있습니다.</p>
          </div>
          <button type="button" className="add-button">+ 공고 추가</button>
        </header>

        <section className="summary" aria-label="지원 요약">
          <div className="stat"><span className="stat-label">오늘의 행동</span><strong className="stat-value">{dashboard.today.length}</strong></div>
          <div className="stat"><span className="stat-label">이번 주 마감</span><strong className="stat-value">{dashboard.thisWeek.length}</strong></div>
          <div className="stat"><span className="stat-label">마감된 공고</span><strong className="stat-value">{dashboard.expiredCount}</strong></div>
        </section>

        <section>
          <div className="section-heading"><h2>오늘 할 일</h2><p>공고별 가장 중요한 행동만 보여드려요.</p></div>
          <div className="action-list">
            {dashboard.today.map((item) => (
              <article className="action-card" key={item.jobId}>
                <div className="dday">{item.dDay === 0 ? "D-Day" : `D-${item.dDay}`}</div>
                <div>
                  <h3 className="job-title">{item.companyName} · {item.positionTitle}</h3>
                  <p className="job-meta">{item.nextAction.label} · 준비 {item.progress ?? 0}%</p>
                </div>
                <a className="action-link" href={`#${item.jobId}`}>계속 준비하기</a>
              </article>
            ))}
          </div>
        </section>

        <section id="applications">
          <div className="section-heading"><h2>이번 주 지원</h2><p>목표 마감일을 우선해 정렬했습니다.</p></div>
          <div className="week-card">
            <table>
              <thead><tr><th>회사</th><th>직무</th><th>기준일</th><th>진행률</th></tr></thead>
              <tbody>
                {dashboard.thisWeek.map((item) => (
                  <tr key={item.jobId}>
                    <td><strong>{item.companyName}</strong></td>
                    <td>{item.positionTitle}</td>
                    <td>{formatDate(item.effectiveDeadline)}</td>
                    <td><div className="progress" aria-label={`준비 ${item.progress ?? 0}%`}><span style={{ width: `${item.progress ?? 0}%` }} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
