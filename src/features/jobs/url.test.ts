import { describe, expect, it } from "vitest";
import { normalizeJobUrl } from "./url";

describe("normalizeJobUrl", () => {
  it("tracking parameter와 fragment를 제거한다", () => {
    expect(normalizeJobUrl("https://Example.com/jobs/1/?utm_source=x&keep=y#apply")).toBe("https://example.com/jobs/1?keep=y");
  });
  it("URL이 없으면 null을 반환한다", () => expect(normalizeJobUrl(null)).toBeNull());
});
