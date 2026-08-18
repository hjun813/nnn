import { describe, expect, it } from "vitest";
import { buildDashboard, calculateProgress, getNextAction, type JobPosting } from "./application";

const baseJob: JobPosting = {
  id: "job-1",
  companyName: "Toss",
  positionTitle: "Server Developer",
  status: "IN_PROGRESS",
  actualDeadline: new Date(2026, 7, 25, 23, 59),
  targetDeadline: new Date(2026, 7, 23, 23, 59),
  createdAt: new Date(2026, 7, 18),
  tasks: [
    { id: "resume", type: "RESUME", title: "이력서", status: "DONE", isRequired: true, sortOrder: 0 },
    { id: "essay", type: "ESSAY", title: "자기소개서", status: "IN_PROGRESS", isRequired: true, sortOrder: 1 },
  ],
};

describe("application domain", () => {
  it("필수 작업만으로 진행률을 계산한다", () => {
    expect(calculateProgress([...baseJob.tasks, { id: "optional", type: "CUSTOM", title: "선택", status: "TODO", isRequired: false, sortOrder: 2 }])).toBe(50);
  });

  it("진행 중인 작업을 다음 행동으로 우선한다", () => {
    expect(getNextAction(baseJob)).toEqual({ type: "CONTINUE_TASK", taskId: "essay", label: "자기소개서 계속하기" });
  });

  it("목표일 기준으로 dashboard를 만들고 완료·보관 공고는 제외한다", () => {
    const dashboard = buildDashboard([
      baseJob,
      { ...baseJob, id: "applied", status: "APPLIED" },
      { ...baseJob, id: "expired", status: "EXPIRED" },
    ], new Date(2026, 7, 18, 9));
    expect(dashboard.today).toHaveLength(1);
    expect(dashboard.today[0].dDay).toBe(5);
    expect(dashboard.expiredCount).toBe(1);
  });
});
