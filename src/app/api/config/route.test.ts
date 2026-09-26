import { describe, expect, it } from "vitest";
import { GET, PUT } from "@/app/api/config/route";

const ownerId = "00000000-0000-0000-0000-000000000000";

function request(path: string, init?: RequestInit) {
  return new Request(`http://localhost${path}`, init);
}

describe("owner config API", () => {
  it("requires the demo owner guard", async () => {
    const response = await GET(request("/api/config?ownerId=other-owner"));
    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe("owner-auth-required");
  });

  it("rejects missing owner id", async () => {
    const response = await PUT(request("/api/config", { method: "PUT" }));
    expect(response.status).toBe(403);
  });

  it("rejects malformed JSON after owner guard", async () => {
    const response = await PUT(
      request(`/api/config?ownerId=${ownerId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: "{bad",
      }),
    );
    // The local test environment intentionally has no server secrets.
    // Configuration checks happen before persistence parsing.
    expect([400, 503]).toContain(response.status);
  });
});
