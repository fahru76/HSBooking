import { NextResponse } from "next/server";
import { createBooking } from "@/lib/db/create-booking";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Public booking request intake.
 *
 * The browser POSTs a validated booking request here; the server owns the
 * write path (the service-role key lives only server-side) and calls the
 * `create_booking` RPC, which re-checks availability atomically before
 * inserting a `pending` booking row.
 *
 * If the Supabase env vars aren't set (e.g. CI or local dev without the
 * Docker stack), the handler degrades honestly to a 202 "not-configured"
 * response — it never fakes a successful booking.
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

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_PHONE = 30;

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function POST(request: Request) {
  // Rate-limit: 5 booking attempts per minute per client IP.
  const ip = getClientIp(request);
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "too-many-requests" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

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
    !Number.isInteger(body.guests) ||
    body.guests < 1 ||
    typeof body.guestName !== "string" ||
    !body.ownerId.trim() ||
    !body.roomId.trim() ||
    !body.guestName.trim() ||
    !isIsoDate(body.checkIn) ||
    !isIsoDate(body.checkOut)
  ) {
    return NextResponse.json({ error: "invalid-payload" }, { status: 400 });
  }

  // Field length bounds — prevent oversized strings reaching the DB.
  if (
    body.guestName.length > MAX_NAME ||
    (body.guestEmail && body.guestEmail.length > MAX_EMAIL) ||
    (body.guestPhone && body.guestPhone.length > MAX_PHONE)
  ) {
    return NextResponse.json({ error: "field-too-long" }, { status: 400 });
  }

  // If the Supabase env isn't configured, respond honestly — no fake success.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { message: "booking-intake-ready (supabase not configured)" },
      { status: 202 },
    );
  }

  try {
    const result = await createBooking({
      ownerId: body.ownerId,
      roomId: body.roomId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
    });

    if ("error" in result) {
      const status = result.error.includes("unavailable") ? 409 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(
      { message: "Booking request received", bookingId: result.id },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown-error";
    return NextResponse.json(
      { error: `server-error: ${msg}` },
      { status: 500 },
    );
  }
}
