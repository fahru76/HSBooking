import { describe, expect, it } from "vitest";
import {
  countNights,
  enumerateDays,
  isRangeAvailable,
  validateStay,
} from "@/lib/bookings/availability";

describe("enumerateDays", () => {
  it("lists inclusive start through exclusive end", () => {
    expect(enumerateDays({ start: "2026-10-01", end: "2026-10-04" })).toEqual([
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
  });

  it("crosses month boundaries", () => {
    expect(enumerateDays({ start: "2026-12-30", end: "2027-01-01" })).toEqual([
      "2026-12-30",
      "2026-12-31",
    ]);
  });
});

describe("countNights", () => {
  it("counts nights as exclusive-end day diff", () => {
    expect(countNights({ start: "2026-10-01", end: "2026-10-04" })).toBe(3);
  });

  it("returns 0 for same-day", () => {
    expect(countNights({ start: "2026-10-01", end: "2026-10-01" })).toBe(0);
  });
});

describe("isRangeAvailable", () => {
  const bookings = [
    {
      id: "b1",
      ownerId: "owner-a",
      roomId: "r1",
      checkIn: "2026-10-05",
      checkOut: "2026-10-08",
      status: "confirmed" as const,
    },
  ];

  it("accepts a gap before an existing booking", () => {
    expect(
      isRangeAvailable({ start: "2026-10-01", end: "2026-10-05" }, [], bookings, "r1"),
    ).toBe(true);
  });

  it("rejects overlap with an existing booking", () => {
    expect(
      isRangeAvailable({ start: "2026-10-04", end: "2026-10-06" }, [], bookings, "r1"),
    ).toBe(false);
  });

  it("allows check-in on the existing check-out day (end-exclusive)", () => {
    // Existing stays through 10-08 morning; a new guest checking in 10-08 is fine.
    expect(
      isRangeAvailable({ start: "2026-10-08", end: "2026-10-10" }, [], bookings, "r1"),
    ).toBe(true);
  });

  it("does not block a different room", () => {
    expect(
      isRangeAvailable({ start: "2026-10-05", end: "2026-10-06" }, [], bookings, "r2"),
    ).toBe(true);
  });

  it("rejects an explicitly blocked date", () => {
    expect(
      isRangeAvailable({ start: "2026-10-10", end: "2026-10-12" }, ["2026-10-11"], bookings, "r1"),
    ).toBe(false);
  });

  it("rejects an inverted range", () => {
    expect(
      isRangeAvailable({ start: "2026-10-12", end: "2026-10-10" }, [], bookings, "r1"),
    ).toBe(false);
  });
});

describe("validateStay", () => {
  it("accepts a valid stay", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 2, roomCapacity: 2 }),
    ).toEqual([]);
  });

  it("flags fewer nights than the minimum", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-03", guests: 1, roomCapacity: 2, minNights: 3 }),
    ).toContain("minimum stay is 3 night(s)");
  });

  it("flags guests over room capacity", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-03", guests: 4, roomCapacity: 2 }),
    ).toContain("room sleeps 2 guest(s)");
  });

  it("flags guests over the owner max", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-03", guests: 6, roomCapacity: 10, maxGuests: 5 }),
    ).toContain("maximum 5 guest(s) per booking");
  });
});

describe("validateStay date guards (NaN regression)", () => {
  it("rejects empty dates with a required error instead of passing via NaN", () => {
    const errors = validateStay({ checkIn: "", checkOut: "", guests: 2, roomCapacity: 4 });
    expect(errors).toContain("check-in and check-out are required");
  });

  it("rejects malformed non-ISO dates", () => {
    const errors = validateStay({ checkIn: "11-01-2026", checkOut: "2026-11-04", guests: 1, roomCapacity: 2 });
    expect(errors).toContain("check-in and check-out are required");
  });

  it("rejects impossible calendar dates", () => {
    const errors = validateStay({ checkIn: "2026-13-99", checkOut: "2026-11-04", guests: 1, roomCapacity: 2 });
    expect(errors).toContain("check-in and check-out are required");
  });

  it("reports both reversed-date and min-nights errors together", () => {
    const errors = validateStay({
      checkIn: "2026-12-05",
      checkOut: "2026-12-01",
      guests: 2,
      roomCapacity: 4,
      minNights: 2,
    });
    expect(errors).toContain("check-out must be after check-in");
    expect(errors).toContain("minimum stay is 2 night(s)");
  });
});

describe("validateStay blockCheckInWeekdays", () => {
  it("rejects check-in on a blocked weekday", () => {
    // 2026-10-04 is a Sunday (weekday 0)
    const errors = validateStay({
      checkIn: "2026-10-04",
      checkOut: "2026-10-06",
      guests: 1,
      roomCapacity: 2,
      blockCheckInWeekdays: [0],
    });
    expect(errors).toContain("check-in is not available on this weekday");
  });

  it("allows check-in on a non-blocked weekday", () => {
    // 2026-10-05 is a Monday (weekday 1)
    const errors = validateStay({
      checkIn: "2026-10-05",
      checkOut: "2026-10-07",
      guests: 1,
      roomCapacity: 2,
      blockCheckInWeekdays: [0],
    });
    expect(errors).toEqual([]);
  });

  it("skips the weekday check when no blocked weekdays are configured", () => {
    const errors = validateStay({
      checkIn: "2026-10-04",
      checkOut: "2026-10-06",
      guests: 1,
      roomCapacity: 2,
    });
    expect(errors).toEqual([]);
  });
});
