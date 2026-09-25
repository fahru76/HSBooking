import { describe, expect, it } from "vitest";
import { createMockSupabase } from "@/test/mock-supabase.test";
import { loadSiteConfig, saveSiteConfig } from "@/lib/db/site-config-repo";
import { DEFAULT_SITE_CONFIG } from "@/lib/config/site-config";

describe("owner content repository", () => {
  it("loads the owner's own config only (owner isolation)", async () => {
    const db = createMockSupabase();
    await db.from("site_configs").insert([
      {
        owner_id: "owner-a",
        config: { siteName: "Casa A" },
      },
      {
        owner_id: "owner-b",
        config: { siteName: "Casa B" },
      },
    ]);

    const config = await loadSiteConfig(db, "owner-a");
    expect(config.siteName).toBe("Casa A");
  });

  it("returns platform defaults when the owner has no config (content fallback)", async () => {
    const db = createMockSupabase();
    const config = await loadSiteConfig(db, "new-owner");
    expect(config.siteName).toBe(DEFAULT_SITE_CONFIG.siteName);
    expect(config.booking.currency).toBe("MYR");
  });

  it("merges a partial config over defaults at load", async () => {
    const db = createMockSupabase();
    await db.from("site_configs").insert([
      { owner_id: "owner-a", config: { location: { address: "1", city: "Ipoh", state: "Perak" } } },
    ]);

    const config = await loadSiteConfig(db, "owner-a");
    expect(config.location.city).toBe("Ipoh");
    expect(config.siteName).toBe(DEFAULT_SITE_CONFIG.siteName);
    expect(config.booking.currency).toBe("MYR");
  });

  it("saves a new owner config", async () => {
    const db = createMockSupabase();
    await saveSiteConfig(db, "owner-a", {
      ...DEFAULT_SITE_CONFIG,
      siteName: "Villa A",
    });

    const config = await loadSiteConfig(db, "owner-a");
    expect(config.siteName).toBe("Villa A");
  });

  it("upserts rather than duplicating on a second save", async () => {
    const db = createMockSupabase();
    await saveSiteConfig(db, "owner-a", { ...DEFAULT_SITE_CONFIG, siteName: "V1" });
    await saveSiteConfig(db, "owner-a", { ...DEFAULT_SITE_CONFIG, siteName: "V2" });

    const { data } = (await db.from("site_configs").select("*").eq("owner_id", "owner-a")) as {
      data: unknown[];
      error: unknown;
    };
    expect(data).toHaveLength(1);
    expect((data[0] as { config: { siteName: string } }).config.siteName).toBe("V2");
  });

  it("keeps one owner's config invisible to another owner", async () => {
    const db = createMockSupabase();
    await saveSiteConfig(db, "owner-a", { ...DEFAULT_SITE_CONFIG, siteName: "A" });

    const configB = await loadSiteConfig(db, "owner-b");
    expect(configB.siteName).toBe(DEFAULT_SITE_CONFIG.siteName);
  });
});
