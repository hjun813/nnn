import { buildDashboard, type JobPosting } from "@/domain/application";

const anchor = new Date(2026, 7, 18, 9);

const jobs: JobPosting[] = [
  {
    id: "nhn-backend",
    companyName: "NHN",
    positionTitle: "Backend Intern",
    status: "IN_PROGRESS",
    actualDeadline: new Date(2026, 7, 20, 23, 59),
    targetDeadline: new Date(2026, 7, 19, 23, 59),
    createdAt: anchor,
    tasks: [
      { id: "nhn-r", type: "RESUME", title: "이력서", status: "DONE", isRequired: true, sortOrder: 0 },
      { id: "nhn-p", type: "PORTFOLIO", title: "포트폴리오", status: "DONE", isRequired: true, sortOrder: 1 },
      { id: "nhn-e", type: "ESSAY", title: "자기소개서", status: "TODO", isRequired: true, sortOrder: 2 },
    ],
  },
  {
    id: "toss-server",
    companyName: "Toss",
    positionTitle: "Server Developer",
    status: "IN_PROGRESS",
    actualDeadline: new Date(2026, 7, 25, 23, 59),
    targetDeadline: new Date(2026, 7, 21, 23, 59),
    createdAt: anchor,
    tasks: [
      { id: "toss-r", type: "RESUME", title: "이력서", status: "DONE", isRequired: true, sortOrder: 0 },
      { id: "toss-p", type: "PORTFOLIO", title: "포트폴리오", status: "IN_PROGRESS", isRequired: true, sortOrder: 1 },
      { id: "toss-e", type: "ESSAY", title: "자기소개서", status: "TODO", isRequired: true, sortOrder: 2 },
    ],
  },
  {
    id: "kakao-backend",
    companyName: "Kakao",
    positionTitle: "Backend Developer",
    status: "IN_PROGRESS",
    actualDeadline: new Date(2026, 7, 25, 23, 59),
    targetDeadline: new Date(2026, 7, 23, 23, 59),
    createdAt: anchor,
    tasks: [
      { id: "kakao-r", type: "RESUME", title: "이력서", status: "DONE", isRequired: true, sortOrder: 0 },
      { id: "kakao-p", type: "PORTFOLIO", title: "포트폴리오", status: "DONE", isRequired: true, sortOrder: 1 },
    ],
  },
];

export function getDashboardPreview() {
  return buildDashboard(jobs, anchor);
}
