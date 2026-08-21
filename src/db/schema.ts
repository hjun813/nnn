import { relations, sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const applicationStatus = pgEnum("application_status", ["SAVED", "IN_PROGRESS", "APPLIED", "EXPIRED", "ARCHIVED"]);
export const taskStatus = pgEnum("task_status", ["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"]);
export const taskType = pgEnum("task_type", ["RESUME", "PORTFOLIO", "ESSAY", "ASSIGNMENT", "CODING_TEST", "CUSTOM"]);
export const deadlineType = pgEnum("deadline_type", ["FIXED", "ALWAYS_OPEN", "UNKNOWN"]);
export const notificationKind = pgEnum("notification_kind", ["DEADLINE_D7", "DEADLINE_D3", "DEADLINE_D1"]);

export const users = pgTable("app_user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobPostings = pgTable("job_posting", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  positionTitle: text("position_title").notNull(),
  sourceUrl: text("source_url"),
  normalizedUrl: text("normalized_url"),
  platform: text("platform"),
  deadlineType: deadlineType("deadline_type").notNull().default("UNKNOWN"),
  actualDeadline: timestamp("actual_deadline", { withTimezone: true }),
  targetDeadline: timestamp("target_deadline", { withTimezone: true }),
  status: applicationStatus("status").notNull().default("SAVED"),
  statusBeforeExpiry: applicationStatus("status_before_expiry"),
  memo: text("memo"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  version: integer("version").notNull().default(1),
}, (table) => [
  uniqueIndex("job_posting_user_normalized_url_unique").on(table.userId, table.normalizedUrl),
  index("job_posting_user_status_target_idx").on(table.userId, table.status, table.targetDeadline),
  index("job_posting_user_status_actual_idx").on(table.userId, table.status, table.actualDeadline),
  check("target_before_actual", sql`${table.targetDeadline} is null or ${table.actualDeadline} is null or ${table.targetDeadline} <= ${table.actualDeadline}`),
]);

export const applicationTasks = pgTable("application_task", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobPostingId: uuid("job_posting_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  type: taskType("type").notNull(),
  title: text("title").notNull(),
  status: taskStatus("status").notNull().default("TODO"),
  isRequired: boolean("is_required").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("application_task_job_order_idx").on(table.jobPostingId, table.sortOrder)]);

export const essayQuestions = pgTable("essay_question", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobPostingId: uuid("job_posting_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const statusHistory = pgTable("status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobPostingId: uuid("job_posting_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  fromStatus: applicationStatus("from_status"),
  toStatus: applicationStatus("to_status").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobPostingId: uuid("job_posting_id").notNull().references(() => jobPostings.id, { onDelete: "cascade" }),
  kind: notificationKind("kind").notNull(),
  triggerDate: date("trigger_date").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("notification_delivery_unique").on(table.userId, table.jobPostingId, table.kind, table.triggerDate),
  index("notification_user_read_created_idx").on(table.userId, table.readAt, table.createdAt),
]);

export const rateLimits = pgTable("rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(1),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}, (table) => [index("rate_limit_expires_idx").on(table.expiresAt)]);

export const jobPostingsRelations = relations(jobPostings, ({ many, one }) => ({
  user: one(users, { fields: [jobPostings.userId], references: [users.id] }),
  applicationTasks: many(applicationTasks),
  essayQuestions: many(essayQuestions),
  statusHistory: many(statusHistory),
  notifications: many(notifications),
}));
export const applicationTasksRelations = relations(applicationTasks, ({ one }) => ({ jobPosting: one(jobPostings, { fields: [applicationTasks.jobPostingId], references: [jobPostings.id] }) }));
export const essayQuestionsRelations = relations(essayQuestions, ({ one }) => ({ jobPosting: one(jobPostings, { fields: [essayQuestions.jobPostingId], references: [jobPostings.id] }) }));
export const notificationsRelations = relations(notifications, ({ one }) => ({
  jobPosting: one(jobPostings, { fields: [notifications.jobPostingId], references: [jobPostings.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));
