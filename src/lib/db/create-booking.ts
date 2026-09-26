/**
 * Server-side booking creation: calls the `create_booking` RPC via the
 * admin client (service-role key, server-only). The RPC re-checks
 * availability atomically before inserting; this wrapper surfaces the
 * RPC's error or returns the new booking id.
 */
import { getAdminClient } from "./admin-client";

export interface CreateBookingParams {
  ownerId: string;
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
}

export async function createBooking(
  params: CreateBookingParams,
): Promise<{ id: string } | { error: string }> {
  const db = getAdminClient();
  const { data, error } = await db.rpc("create_booking", {
    p_owner_id: params.ownerId,
    p_room_id: params.roomId,
    p_check_in: params.checkIn,
    p_check_out: params.checkOut,
    p_guests: params.guests,
    p_guest_name: params.guestName,
    p_guest_email: params.guestEmail ?? null,
    p_guest_phone: params.guestPhone ?? null,
  });

  if (error) {
    // The RPC raises 'unavailable' or 'invalid-params' as Postgres
    // exceptions; surface the message as the error code.
    return { error: error.message };
  }

  return { id: data as string };
}
