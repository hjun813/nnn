import { describe, expect, it } from "vitest";
import { daysUntil, notificationKindFor } from "./service";

describe("deadline notifications", () => {
  const now = new Date("2026-08-18T01:00:00Z");
  it.each([[7, "DEADLINE_D7"], [3, "DEADLINE_D3"], [1, "DEADLINE_D1"]] as const)("D-%i 알림을 선택한다", (days, kind) => {
    expect(notificationKindFor(new Date(`2026-08-${18 + days}T23:59:00Z`), now)).toBe(kind);
  });
  it("대상 날짜가 아니면 알림을 만들지 않는다", () => expect(notificationKindFor(new Date("2026-08-20T00:00:00Z"), now)).toBeNull());
  it("달력 날짜 차이를 계산한다", () => expect(daysUntil(new Date("2026-08-19T23:00:00Z"), now)).toBe(1));
});
