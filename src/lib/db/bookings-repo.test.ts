import { describe, expect, it } from "vitest";
import { checkAvailability } from "@/lib/db/bookings-repo";

type RpcResult = { data: unknown; error: { message: string } | null };

/** Minimal client that records the RPC call it received. */
function makeClient(next: (fn: string, params: Record<string, unknown>) => RpcResult) {
  const calls: Array<{ fn: string; params: Record<string, unknown> }> = [];
  const client = {
    // The DbClient type requires `from`; bookings-repo never uses it, so a
    // stub keeps the compile honest about the repo's real surface.
    from: () => {
      throw new Error("bookings-repo must never read via from()");
    },
    rpc: async (fn: string, params: Record<string, unknown> = {}) => {
      calls.push({ fn, params });
      return next(fn, params);
    },
    _calls: calls,
  };
  return client;
}

describe("checkAvailability repo", () => {
  it("calls the check_availability RPC with owner-scoped params", async () => {
    const db = makeClient(() => ({ data: true, error: null }));
    await checkAvailability(db, {
      ownerId: "owner-a",
      roomId: "deluxe",
      start: "2026-11-01",
      end: "2026-11-04",
    });
    expect(db._calls).toHaveLength(1);
    expect(db._calls[0].fn).toBe("check_availability");
    expect(db._calls[0].params).toEqual({
      p_owner_id: "owner-a",
      p_room_id: "deluxe",
      p_start: "2026-11-01",
      p_end: "2026-11-04",
    });
  });

  it("maps a false result to an unavailable stay", async () => {
    const db = makeClient(() => ({ data: false, error: null }));
    await expect(
      checkAvailability(db, { ownerId: "o", roomId: "r", start: "2026-11-01", end: "2026-11-02" }),
    ).resolves.toBe(false);
  });

  it("throws and surfaces the server message when the RPC rejects", async () => {
    const db = makeClient(() => ({ data: null, error: { message: "rpc denied" } }));
    await expect(
      checkAvailability(db, { ownerId: "o", roomId: "r", start: "2026-11-01", end: "2026-11-02" }),
    ).rejects.toThrow("rpc denied");
  });
});
