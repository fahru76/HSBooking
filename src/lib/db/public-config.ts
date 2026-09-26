/**
 * Server-side config loader for the public page.
 *
 * Reads the owner's site_configs row via the admin client (service-role
 * key, server-only). Falls back to DEMO_SITE_CONFIG when Supabase is
 * not configured (CI, local dev without Docker stack) so the page always
 * renders something presentable.
 */
import { getAdminClient } from "@/lib/db/admin-client";
import { mergeSiteConfig, type SiteConfig } from "@/lib/config/site-config";
import { DEMO_SITE_CONFIG } from "@/lib/config/demo-config";

/** The demo owner id — replace with a real auth lookup when auth is wired. */
const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000000";

export async function getPublicSiteConfig(): Promise<SiteConfig> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return DEMO_SITE_CONFIG;
  }

  try {
    const db = getAdminClient();
    const { data, error } = await db
      .from("site_configs")
      .select("config")
      .eq("owner_id", DEMO_OWNER_ID)
      .maybeSingle();

    if (error) {
      console.error("public-config-load-error:", error.message);
      return DEMO_SITE_CONFIG;
    }

    const config = (data as { config?: SiteConfig } | null)?.config;
    return mergeSiteConfig(config);
  } catch (err) {
    console.error("public-config-exception:", err);
    return DEMO_SITE_CONFIG;
  }
}
