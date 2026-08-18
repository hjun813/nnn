import { z } from "zod";

const optionalUrl = z.union([z.string().trim().url("올바른 URL을 입력해주세요."), z.literal("")]).optional().transform((value) => value || null);
const optionalDate = z.union([z.string().datetime({ offset: true }), z.literal(""), z.null()]).optional().transform((value) => value ? new Date(value) : null);
const patchUrl = z.union([z.string().trim().url("올바른 URL을 입력해주세요."), z.literal(""), z.null()]).optional().transform((value) => value === undefined ? undefined : value || null);
const patchDate = z.union([z.string().datetime({ offset: true }), z.literal(""), z.null()]).optional().transform((value) => value === undefined ? undefined : value ? new Date(value) : null);

export const taskInputSchema = z.object({
  type: z.enum(["RESUME", "PORTFOLIO", "ESSAY", "ASSIGNMENT", "CODING_TEST", "CUSTOM"]),
  title: z.string().trim().min(1).max(100),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "NOT_REQUIRED"]).default("TODO"),
  isRequired: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const createJobSchema = z.object({
  companyName: z.string().trim().min(1, "회사명을 입력해주세요.").max(100),
  positionTitle: z.string().trim().min(1, "직무명을 입력해주세요.").max(150),
  sourceUrl: optionalUrl,
  platform: z.string().trim().max(50).optional().transform((value) => value || null),
  deadlineType: z.enum(["FIXED", "ALWAYS_OPEN", "UNKNOWN"]).default("UNKNOWN"),
  actualDeadline: optionalDate,
  targetDeadline: optionalDate,
  memo: z.string().trim().max(2000).optional().transform((value) => value || null),
  tasks: z.array(taskInputSchema).max(30).default([]),
}).superRefine((value, context) => {
  if (value.deadlineType === "FIXED" && !value.actualDeadline) context.addIssue({ code: "custom", path: ["actualDeadline"], message: "고정 마감에는 실제 마감일이 필요합니다." });
  if (value.targetDeadline && value.actualDeadline && value.targetDeadline > value.actualDeadline) context.addIssue({ code: "custom", path: ["targetDeadline"], message: "목표일은 실제 마감 이후일 수 없습니다." });
});

export const updateJobSchema = z.object({
  companyName: z.string().trim().min(1).max(100).optional(),
  positionTitle: z.string().trim().min(1).max(150).optional(),
  sourceUrl: patchUrl,
  platform: z.string().trim().max(50).nullable().optional(),
  deadlineType: z.enum(["FIXED", "ALWAYS_OPEN", "UNKNOWN"]).optional(),
  actualDeadline: patchDate,
  targetDeadline: patchDate,
  memo: z.string().trim().max(2000).nullable().optional(),
  version: z.number().int().positive(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["SAVED", "IN_PROGRESS", "APPLIED", "ARCHIVED"]),
});

export const updateTaskSchema = taskInputSchema.partial().extend({ version: z.number().int().positive().optional() });

export type CreateJobInput = z.infer<typeof createJobSchema>;
