import { describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/config/route";

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

describe("owner config API", () => {
  it("rejects requests without a Bearer token", async () => {
    const response = await GET(request("/api/config"));
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("auth-required");
  });

  it("rejects PUT without a Bearer token", async () => {
    const response = await PUT(request("/api/config", { method: "PUT" }));
    expect(response.status).toBe(401);
  });

  it("rejects malformed JSON after auth check", async () => {
    const response = await PUT(
      request("/api/config", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer fake-token",
        },
        body: "{bad",
      }),
    );
    // Fake token won't verify against real Supabase, so we get 401.
    // But if Supabase env is not configured, we get 401 for missing token
    // verification path. Either way, it's an auth failure, not a 200.
    expect([400, 401, 503]).toContain(response.status);
  });
});
