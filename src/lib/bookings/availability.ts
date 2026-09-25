/**
 * Booking availability helpers — pure domain logic shared by the public
 * site and the owner calendar. No Supabase dependency; testable locally.
 */

export interface DateRange {
  start: string; // YYYY-MM-DD (check-in)
  end: string; // YYYY-MM-DD (check-out, exclusive)
}

export interface Booking {
  id: string;
  ownerId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: "confirmed" | "pending" | "cancelled";
}

/**
 * Whether a stay range overlaps any blocked date or an active booking
 * on the same room. `end` is exclusive (check-out morning).
 */
export function isRangeAvailable(
  range: DateRange,
  blockedDates: string[],
  bookings: Booking[],
  roomId: string,
): boolean {
  if (range.start >= range.end) return false;

  for (const day of enumerateDays(range)) {
    if (blockedDates.includes(day)) return false;
  }

  const active = bookings.filter(
    (b) => b.roomId === roomId && (b.status === "confirmed" || b.status === "pending"),
  );
  for (const b of active) {
    // Overlap iff existing stay intersects the requested stay.
    if (range.start < b.checkOut && range.end > b.checkIn) return false;
  }
  return true;
}

/** All YYYY-MM-DD dates between start (inclusive) and end (exclusive). */
export function enumerateDays({ start, end }: DateRange): string[] {
  const days: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const stop = new Date(`${end}T00:00:00Z`);
  while (cursor < stop) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export interface StayAttempt {
  checkIn: string;
  checkOut: string;
  minNights?: number;
  maxGuests?: number;
  guests: number;
  roomCapacity: number;
}

/** Returns a list of human-readable booking-rule violations (empty = valid). */
export function validateStay(attempt: StayAttempt): string[] {
  const errors: string[] = [];

  const inParsed = parseDate(attempt.checkIn);
  const outParsed = parseDate(attempt.checkOut);

  if (!inParsed || !outParsed) {
    // Reject empty / non-YYYY-MM-DD / impossible dates instead of letting
    // countNights produce NaN, which made every numeric guard silently pass.
    errors.push("check-in and check-out are required");
  } else {
    const nights = countNights({ start: attempt.checkIn, end: attempt.checkOut });
    if (nights < 1) errors.push("check-out must be after check-in");

    if (attempt.minNights !== undefined && nights < attempt.minNights) {
      errors.push(`minimum stay is ${attempt.minNights} night(s)`);
    }
  }

  if (attempt.guests > attempt.roomCapacity) {
    errors.push(`room sleeps ${attempt.roomCapacity} guest(s)`);
  }

  if (attempt.maxGuests !== undefined && attempt.guests > attempt.maxGuests) {
    errors.push(`maximum ${attempt.maxGuests} guest(s) per booking`);
  }

  return errors;
}

/** Strict YYYY-MM-DD → Date, or null when impossible. Dates are always UTC. */
function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function countNights({ start, end }: DateRange): number {
  const a = new Date(`${start}T00:00:00Z`).getTime();
  const b = new Date(`${end}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}
