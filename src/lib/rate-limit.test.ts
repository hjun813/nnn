import { describe, expect, it } from "vitest";
import { getRequestIp } from "./rate-limit";

describe("getRequestIp", () => {
  it("uses the first forwarded address", () => {
    const request = new Request("https://applyflow.test", {
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
    });
    expect(getRequestIp(request)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip and then unknown", () => {
    expect(getRequestIp(new Request("https://applyflow.test", { headers: { "x-real-ip": "203.0.113.11" } }))).toBe("203.0.113.11");
    expect(getRequestIp(new Request("https://applyflow.test"))).toBe("unknown");
  });
});
