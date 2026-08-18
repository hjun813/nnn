import { describe, expect, it } from "vitest";
import { shouldExpire } from "./expiry";

describe("shouldExpire", () => {
  const now = new Date("2026-08-18T12:00:00Z");
  it("마감된 미지원 공고만 만료한다", () => {
    expect(shouldExpire("SAVED", new Date("2026-08-18T11:59:59Z"), now)).toBe(true);
    expect(shouldExpire("IN_PROGRESS", new Date("2026-08-17T00:00:00Z"), now)).toBe(true);
  });
  it("지원·보관·미정·미래 공고는 만료하지 않는다", () => {
    expect(shouldExpire("APPLIED", new Date("2026-08-17T00:00:00Z"), now)).toBe(false);
    expect(shouldExpire("ARCHIVED", new Date("2026-08-17T00:00:00Z"), now)).toBe(false);
    expect(shouldExpire("SAVED", null, now)).toBe(false);
    expect(shouldExpire("SAVED", new Date("2026-08-19T00:00:00Z"), now)).toBe(false);
  });
});
