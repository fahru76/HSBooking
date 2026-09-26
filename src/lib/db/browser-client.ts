/**
 * Browser-side Supabase client.
 *
 * Uses the anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) — safe for the browser.
 * The service-role key is NEVER imported here.
 *
 * This client handles auth (sign-in, sign-up, session) and client-side
 * database reads that go through RLS (e.g. public site_configs SELECT).
 * Privileged writes go through server route handlers with the service-role
 * key (admin-client.ts).
 */

import { createClient } from "@supabase/supabase-js";

export type BrowserClient = ReturnType<typeof createClient>;

export function getBrowserClient(): BrowserClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
