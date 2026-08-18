import { eq, inArray } from "drizzle-orm";
import { buildDashboard, type ApplicationTask, type Dashboard, type JobPosting } from "@/domain/application";
import { getDb } from "./client";
import { applicationTasks, jobPostings, users } from "./schema";

export async function findUserByEmail(email: string) {
  const [user] = await getDb().select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return user;
}

export async function findUserById(id: string) {
  const [user] = await getDb().select({ id: users.id, email: users.email, timezone: users.timezone }).from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function loadDashboard(userId: string, now = new Date()): Promise<Dashboard> {
  const records = await getDb().select().from(jobPostings).where(eq(jobPostings.userId, userId));
  const ids = records.map((job) => job.id);
  const tasks = ids.length === 0 ? [] : await getDb().select().from(applicationTasks).where(inArray(applicationTasks.jobPostingId, ids));
  const tasksByJob = Map.groupBy(tasks, (task) => task.jobPostingId);

  const jobs: JobPosting[] = records.map((job) => ({
    id: job.id,
    companyName: job.companyName,
    positionTitle: job.positionTitle,
    status: job.status,
    actualDeadline: job.actualDeadline,
    targetDeadline: job.targetDeadline,
    createdAt: job.createdAt,
    tasks: (tasksByJob.get(job.id) ?? []).map((task): ApplicationTask => ({
      id: task.id,
      type: task.type,
      title: task.title,
      status: task.status,
      isRequired: task.isRequired,
      sortOrder: task.sortOrder,
    })),
  }));

  return buildDashboard(jobs, now);
}
