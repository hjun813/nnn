import { describe, expect, it } from "vitest";
import { createJobSchema, updateJobSchema } from "./schemas";

describe("job schemas", () => {
  it("수정에서 누락된 nullable 필드를 유지한다", () => {
    const value = updateJobSchema.parse({ companyName: "새 회사", version: 1 });
    expect(value).not.toHaveProperty("sourceUrl");
    expect(value).not.toHaveProperty("actualDeadline");
    expect(value).not.toHaveProperty("targetDeadline");
  });

  it("목표일이 실제 마감보다 늦은 등록을 거부한다", () => {
    const result = createJobSchema.safeParse({
      companyName: "회사",
      positionTitle: "개발자",
      deadlineType: "FIXED",
      actualDeadline: "2026-08-20T09:00:00+09:00",
      targetDeadline: "2026-08-21T09:00:00+09:00",
    });
    expect(result.success).toBe(false);
  });
});
