import { NextResponse } from "next/server";

/**
 * Public booking request intake.
 *
 * The browser POSTs a validated booking request here; the server owns the
 * write path (the service-role key lives only server-side) and enforces the
 * booking rules again before hitting the guarded RPC.
 *
 * NOTE: In the current slice the handler is a thin, honest stub — Supabase
 * writes land in the next slice. It logs, and is ready to be backed by a
 * server-side admin client that inserts a `pending` booking and pings the
 * owner. It never returns a fake "created" to the client.
 */

interface BookingRequest {
  ownerId: string;
  roomId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
}

export async function POST(request: Request) {
  let body: BookingRequest;
  try {
    body = (await request.json()) as BookingRequest;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  // Minimal shape validation before any domain work.
  if (
    !body ||
    typeof body.ownerId !== "string" ||
    typeof body.roomId !== "string" ||
    typeof body.checkIn !== "string" ||
    typeof body.checkOut !== "string" ||
    typeof body.guests !== "number" ||
    typeof body.guestName !== "string"
  ) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  // NOTE: write path intentionally unimplemented to avoid faking persistence.
  // The next slice replaces this `return` with a server-side Supabase insert.
  return NextResponse.json(
    { message: "booking-intake-ready", received: { ownerId: body.ownerId, roomId: body.roomId, checkIn: body.checkIn, checkOut: body.checkOut, guests: body.guests } },
    { status: 202 },
  );
}
