import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/bookings/route";

const valid = {
  ownerId: "00000000-0000-0000-0000-000000000000",
  roomId: "deluxe",
  checkIn: "2026-11-10",
  checkOut: "2026-11-12",
  guests: 2,
  guestName: "Aina Rahman",
};

async function post(body: unknown) {
  const response = await POST(
    new Request("http://localhost/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return { status: response.status, body: await response.json() };
}

describe("POST /api/bookings", () => {
  it("accepts a valid request when Supabase is not configured", async () => {
    const result = await post(valid);
    expect(result.status).toBe(202);
    expect(result.body.message).toContain("supabase not configured");
  });

  it.each([
    ["blank owner id", { ...valid, ownerId: "   " }],
    ["blank room id", { ...valid, roomId: "" }],
    ["blank guest name", { ...valid, guestName: "  " }],
    ["non-integer guests", { ...valid, guests: 1.5 }],
    ["non-finite guests", { ...valid, guests: null }],
    ["invalid check-in", { ...valid, checkIn: "2026-99-40" }],
    ["invalid check-out", { ...valid, checkOut: "not-a-date" }],
  ])("rejects %s before persistence", async (_label, body) => {
    const result = await post(body);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe("invalid-payload");
  });

  it("rejects malformed JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{not-json",
      }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("invalid-json");
  });
});
