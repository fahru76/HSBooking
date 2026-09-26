import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db/admin-client";
import { mergeSiteConfig, type SiteConfig } from "@/lib/config/site-config";

/**
 * Owner config API: GET reads the current config, PUT saves a new one.
 *
 * Auth is not wired yet; the ownerId is derived from a query param (demo
 * mode). When Supabase Auth is connected, the ownerId will come from the
 * session's auth.uid() claim instead.
 */

const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000000";

function readDemoOwner(request: Request): string | null {
  const ownerId = new URL(request.url).searchParams.get("ownerId");
  return ownerId === DEMO_OWNER_ID ? ownerId : null;
}

export async function GET(request: Request) {
  const ownerId = readDemoOwner(request);
  if (!ownerId) {
    return NextResponse.json({ error: "owner-auth-required" }, { status: 403 });
  }

  // This demo guard is temporary. Replace with auth.uid() before production.
  // It prevents the public endpoint from becoming an arbitrary owner write/read
  // surface while Supabase Auth is not yet wired into the owner area.
  
  
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
  const ownerId = readDemoOwner(request);
  if (!ownerId) {
    return NextResponse.json({ error: "owner-auth-required" }, { status: 403 });
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
