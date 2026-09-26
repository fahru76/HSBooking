import { describe, expect, it, beforeEach } from "vitest";
import { rateLimit, __resetRateLimit, getClientIp } from "@/lib/rate-limit";

beforeEach(() => __resetRateLimit());

describe("rateLimit", () => {
  it("allows the first request from a new IP", () => {
    expect(rateLimit("1.2.3.4", 1000)).toBe(true);
  });

  it("blocks after the max requests in the window", () => {
    const ip = "1.2.3.5";
    for (let i = 0; i < 5; i++) rateLimit(ip, 1000 + i);
    expect(rateLimit(ip, 1006)).toBe(false);
  });

  it("allows again after the window slides past", () => {
    const ip = "1.2.3.6";
    for (let i = 0; i < 5; i++) rateLimit(ip, 1000 + i);
    // 70 seconds later — all old timestamps are outside the 60s window.
    expect(rateLimit(ip, 71_000)).toBe(true);
  });

  it("tracks IPs independently", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 1000 + i);
    expect(rateLimit("b", 1000)).toBe(true);
    expect(rateLimit("a", 1006)).toBe(false);
  });

  it("prunes stale entries so the map cannot grow without bound", () => {
    rateLimit("stale", 1000);
    // Well past the 60s window — the old timestamp is pruned on the next call.
    rateLimit("stale", 200_000);
    expect(rateLimit("stale", 200_001)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("extracts from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("extracts from x-real-ip when no forwarded header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.8.7.6" },
    });
    expect(getClientIp(req)).toBe("9.8.7.6");
  });

  it("falls back to unknown", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});
