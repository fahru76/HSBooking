import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/db/admin-client";
import { mergeSiteConfig, type SiteConfig } from "@/lib/config/site-config";

/**
 * Owner config API: GET reads the current config, PUT saves a new one.
 *
 * The owner ID is extracted from the JWT in the Authorization header.
 * The service-role admin client is used for the DB write (bypasses RLS
 * because the route handler is the trusted boundary), but the owner
 * identity comes from the user's own session token — not a query param.
 */

/** Extract the owner UUID from the Bearer token. */
async function getOwnerId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  // Use the anon key to verify the user's token — this respects RLS
  // and validates the JWT cryptographically.
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function GET(request: Request) {
  const ownerId = await getOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "auth-required" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "supabase-not-configured" },
      { status: 503 },
    );
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("site_configs")
    .select("config")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const config: SiteConfig = mergeSiteConfig(
    (data as { config?: SiteConfig } | null)?.config,
  );
  return NextResponse.json({ config });
}

export async function PUT(request: Request) {
  const ownerId = await getOwnerId(request);
  if (!ownerId) {
    return NextResponse.json({ error: "auth-required" }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "supabase-not-configured" },
      { status: 503 },
    );
  }

  let body: { config?: SiteConfig };
  try {
    body = (await request.json()) as { config?: SiteConfig };
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  if (!body?.config || typeof body.config !== "object") {
    return NextResponse.json(
      { error: "invalid-payload" },
      { status: 400 },
    );
  }

  const db = getAdminClient();
  const { data: existing } = await db
    .from("site_configs")
    .select("owner_id")
    .eq("owner_id", ownerId)
    .maybeSingle();

  const payload = { owner_id: ownerId, config: body.config };

  if (existing) {
    const { error } = await db
      .from("site_configs")
      .update(payload)
      .eq("owner_id", ownerId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await db.from("site_configs").insert(payload);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Config saved" }, { status: 200 });
}
