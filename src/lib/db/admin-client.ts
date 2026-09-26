/**
 * Server-side Supabase admin client.
 *
 * Uses the SERVICE_ROLE key — server-only, never bundled into the browser.
 * The route handler uses the guarded booking RPC and owner-config API.
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL  — the Supabase API URL (safe for browser too)
 *   SUPABASE_SERVICE_ROLE_KEY — server-only secret
 *
 * In local dev these come from `supabase status --output env` → .env.local.
 * In production they come from the hosting platform's env vars.
 */
// ts-supabase-ignore: the package ships types at dist/index.d.cts but its
// "exports" map doesn't resolve under Node 26's stricter ESM resolution.
// We use a local type alias instead of importing the type from the package.
import { createClient } from "@supabase/supabase-js";

type SupabaseClient = ReturnType<typeof createClient>;

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
