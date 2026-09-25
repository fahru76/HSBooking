import {
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/config/site-config";
import type { MockQuery } from "@/test/mock-supabase.test";

/**
 * Owner-config repo. The db is an injectable Supabase-shaped client: the
 * real @supabase/supabase-js client in the app, or createMockSupabase() in
 * tests. All reads are scoped to the owner id.
 */
export type DbClient = { from: (table: string) => MockQuery };

export interface ConfigRow {
  owner_id: string;
  config: SiteConfig;
}

export async function loadSiteConfig(
  db: DbClient,
  ownerId: string,
): Promise<SiteConfig> {
  const { data } = await db
    .from("site_configs")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  // Content fallback: a missing or partial owner config degrades to the
  // platform defaults instead of a broken page.
  const config = (data as { config?: SiteConfig } | null)?.config;
  return mergeSiteConfig(config);
}

export async function saveSiteConfig(
  db: DbClient,
  ownerId: string,
  config: SiteConfig,
): Promise<void> {
  const table = db.from("site_configs");
  const { data: existing } = await table.select("*").eq("owner_id", ownerId).maybeSingle();

  const payload = { owner_id: ownerId, config };
  if (existing) {
    await table.update(payload).eq("owner_id", ownerId);
  } else {
    await table.insert(payload);
  }
}
