"use client";

import { useState } from "react";
import type { SiteConfig } from "@/lib/config/site-config";
import { validateStay } from "@/lib/bookings/availability";

/**
 * Guest booking request form. Client-side, real responsibility: validate the
 * stay against booking rules and gather the details the owner needs.
 *
 * Submit path: the form POSTs the validated request to the (server-side)
 * booking intake handler. The demo form pre-fills the guest name so an
 * end-to-end click through is still possible without typing; the response is
 * shown in place (no fake persistence — the demo marker is explicit).
 */

interface SubmitState {
  status: "idle" | "sending" | "received" | "error";
  message: string;
}

export function BookingForm({ config }: { config: SiteConfig }) {
  const [selectedRoomId, setSelectedRoomId] = useState(config.rooms[0]?.id ?? "");
  const room = config.rooms.find((r) => r.id === selectedRoomId) ?? config.rooms[0] ?? null;
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  if (!room) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateStay({
      checkIn,
      checkOut,
      guests,
      minNights: config.booking.minNights,
      maxGuests: config.booking.maxGuests,
      roomCapacity: room.capacity,
      blockCheckInWeekdays: config.booking.blockCheckInWeekdays,
    });
    setErrors(validationErrors);
    if (validationErrors.length > 0) {
      setSubmitState({ status: "idle", message: "" });
      return;
    }

    setSubmitState({ status: "sending", message: "Checking availability…" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: config.owner.id,
          roomId: room.id,
          checkIn,
          checkOut,
          guests,
          guestName: guestName.trim() || "Demo guest",
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (res.ok) {
        setSubmitState({
          status: "received",
          message: data.message ?? "Request received.",
        });
      } else {
        setSubmitState({
          status: "error",
          message: data.error ?? "Could not send your request.",
        });
      }
    } catch {
      setSubmitState({
        status: "error",
        message: "Network error — please try again.",
      });
    }
  }

  return (
    <section id="book" className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="mb-3 font-display text-3xl font-medium text-foreground sm:text-4xl">
          Check Availability
        </h2>
        <p className="mb-8 text-sm text-muted">
          Pick your dates — we reply within the hour.
        </p>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Room</span>
            <select
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground"
              aria-label="Room"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              {config.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Check-in</span>
            <input
              type="date"
              required
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Check-out</span>
            <input
              type="date"
              required
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-foreground">Guests</span>
            <input
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="block text-sm sm:col-span-2 lg:col-span-4">
            <span className="mb-1 block font-medium text-foreground">
              Your name
            </span>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Demo booking — prefilled"
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              disabled={submitState.status === "sending"}
              className="rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitState.status === "sending"
                ? "Checking…"
                : "Check availability"}
            </button>
          </div>
          {errors.length > 0 ? (
            <ul className="sm:col-span-2 lg:col-span-4 space-y-1 text-sm text-[#e07d5c]">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
          {submitState.status === "received" ? (
            <p className="sm:col-span-2 lg:col-span-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-foreground">
              {submitState.message}
            </p>
          ) : null}
          {submitState.status === "error" ? (
            <p className="sm:col-span-2 lg:col-span-4 rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-[#e07d5c]">
              {submitState.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
