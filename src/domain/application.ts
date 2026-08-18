export type ApplicationStatus = "SAVED" | "IN_PROGRESS" | "APPLIED" | "EXPIRED" | "ARCHIVED";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "NOT_REQUIRED";
export type TaskType = "RESUME" | "PORTFOLIO" | "ESSAY" | "ASSIGNMENT" | "CODING_TEST" | "CUSTOM";

export interface ApplicationTask {
  id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
  isRequired: boolean;
  sortOrder: number;
}

export interface JobPosting {
  id: string;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  actualDeadline: Date | null;
  targetDeadline: Date | null;
  tasks: ApplicationTask[];
  createdAt: Date;
}

export interface DashboardItem {
  jobId: string;
  companyName: string;
  positionTitle: string;
  effectiveDeadline: Date;
  actualDeadline: Date | null;
  dDay: number;
  progress: number | null;
  nextAction: { type: "CONTINUE_TASK" | "START_TASK" | "APPLY" | "REVIEW_REQUIREMENTS"; taskId?: string; label: string };
}

export interface Dashboard {
  today: DashboardItem[];
  thisWeek: DashboardItem[];
  expiredCount: number;
}

export function calculateProgress(tasks: ApplicationTask[]): number | null {
  const required = tasks.filter((task) => task.isRequired && task.status !== "NOT_REQUIRED");
  if (required.length === 0) return null;
  const done = required.filter((task) => task.status === "DONE").length;
  return Math.round((done / required.length) * 100);
}

export function getEffectiveDeadline(job: JobPosting): Date | null {
  return job.targetDeadline ?? job.actualDeadline;
}

export function getNextAction(job: JobPosting): DashboardItem["nextAction"] {
  const eligible = [...job.tasks]
    .filter((task) => task.isRequired && task.status !== "NOT_REQUIRED")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const active = eligible.find((task) => task.status === "IN_PROGRESS");
  if (active) return { type: "CONTINUE_TASK", taskId: active.id, label: `${active.title} 계속하기` };
  const todo = eligible.find((task) => task.status === "TODO");
  if (todo) return { type: "START_TASK", taskId: todo.id, label: `${todo.title} 시작하기` };
  if (eligible.length > 0) return { type: "APPLY", label: "지원하기" };
  return { type: "REVIEW_REQUIREMENTS", label: "필요 서류 확인하기" };
}

export function differenceInCalendarDays(deadline: Date, now: Date): number {
  const utcDeadline = Date.UTC(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((utcDeadline - utcNow) / 86_400_000);
}

export function buildDashboard(jobs: JobPosting[], now: Date): Dashboard {
  const active = jobs
    .filter((job) => !["APPLIED", "ARCHIVED", "EXPIRED"].includes(job.status))
    .map((job) => {
      const deadline = getEffectiveDeadline(job);
      if (!deadline) return null;
      return {
        jobId: job.id,
        companyName: job.companyName,
        positionTitle: job.positionTitle,
        effectiveDeadline: deadline,
        actualDeadline: job.actualDeadline,
        dDay: differenceInCalendarDays(deadline, now),
        progress: calculateProgress(job.tasks),
        nextAction: getNextAction(job),
      } satisfies DashboardItem;
    })
    .filter((item): item is DashboardItem => item !== null && item.dDay >= 0)
    .sort((a, b) => a.effectiveDeadline.getTime() - b.effectiveDeadline.getTime());

  return {
    today: active.slice(0, 3),
    thisWeek: active.filter((item) => item.dDay <= 7),
    expiredCount: jobs.filter((job) => job.status === "EXPIRED").length,
  };
}
