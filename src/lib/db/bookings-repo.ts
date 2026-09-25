/**
 * Booking persistence + availability repository.
 *
 * Client-facing only — never runs on the server with the service-role key.
 * Availability goes through the guarded `check_availability` RPC, which is
 * security-definer + owner-scoped on the Postgres side; the browser never
 * queries the `bookings` table directly (it carries guest PII).
 */
import type { MockQuery } from "@/test/mock-supabase.test";

export type DbClient = { from: (table: string) => MockQuery } & {
  rpc: (fn: string, params?: Record<string, unknown>) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
};

export interface AvailabilityQuery {
  ownerId: string;
  roomId: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD, exclusive
}

/** True when the stay is free of booking conflicts + owner-blocked days. */
export async function checkAvailability(
  db: DbClient,
  q: AvailabilityQuery,
): Promise<boolean> {
  const { data, error } = await db.rpc("check_availability", {
    p_owner_id: q.ownerId,
    p_room_id: q.roomId,
    p_start: q.start,
    p_end: q.end,
  });
  if (error) throw new Error(error.message);
  return data === true;
}
