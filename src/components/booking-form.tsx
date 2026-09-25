"use client";

import { useState } from "react";
import type { SiteConfig } from "@/lib/config/site-config";
import { validateStay } from "@/lib/bookings/availability";

/**
 * Guest booking form. Client-side. Validates input against booking rules
 * (capacity, nights, guest max) before allowing submission.
 * Persistence + payment arrive later; the future submit path will be a
 * server action / RPC, not a client-side write.
 */
export function BookingForm({ config }: { config: SiteConfig }) {
  const room = config.rooms[0] ?? null;
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  if (!room) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateStay({
      checkIn,
      checkOut,
      guests,
      minNights: config.booking.minNights,
      maxGuests: config.booking.maxGuests,
      roomCapacity: room.capacity,
    });
    setErrors(errors);
    if (errors.length === 0) {
      // TODO: submit to server action / booking RPC in a later slice.
      window.alert("Booking request received (demo). Payment flow coming soon.");
    }
  }

  return (
    <section id="book" className="bg-zinc-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Check Availability</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Room</span>
            <select
              className="w-full rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm"
              aria-label="Room"
              defaultValue={room.id}
            >
              <option value={room.id}>{room.name}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Check-in</span>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Check-out</span>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">Guests</span>
            <input
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Check availability
            </button>
          </div>
          {errors.length > 0 ? (
            <ul className="sm:col-span-2 lg:col-span-4 space-y-1 text-sm text-red-600">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </form>
      </div>
    </section>
  );
}
