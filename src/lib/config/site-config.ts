/**
 * Site configuration contract — the reusable, owner-configurable content
 * shape shared by the public site and the owner backend.
 *
 * Every field here is data-driven: no homestay identity is hard-coded into
 * components. The public surface renders ONLY what a configured owner
 * provides, falling back to safe defaults for missing fields.
 */

export type Currency = "MYR";

export interface RoomConfig {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  baseRatePerNight: number;
  photos?: string[];
}

export interface BookingSettings {
  currency: Currency;
  minNights?: number;
  maxGuests?: number;
  /** ISO date strings (YYYY-MM-DD) the owner has blocked entirely. */
  blockedDates?: string[];
  /** Guests may not check in on these weekdays (0=Sunday ... 6=Saturday). */
  blockCheckInWeekdays?: number[];
}

export interface SiteConfig {
  siteName: string;
  tagline?: string;
  description?: string;
  owner: {
    /** Owner account id (Supabase auth uid in production; demo seed in dev). */
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  amenities: string[];
  policies: {
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string[];
    cancellation?: string;
  };
  rooms: RoomConfig[];
  booking: BookingSettings;
  contact: {
    email?: string;
    phone?: string;
  };
}

/** The safe fallback a site uses for any field the owner left unset. */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: "Homestay Malaysia",
  owner: {
    name: "Homestay Owner",
  },
  location: {
    address: "",
    city: "",
    state: "",
  },
  amenities: [],
  policies: {},
  rooms: [],
  booking: {
    currency: "MYR",
  },
  contact: {},
};

/**
 * Merge an owner's partial config over the defaults. Missing (undefined)
 * fields keep the default; explicitly-set fields always win.
 */
export function mergeSiteConfig(partial: Partial<SiteConfig> | null | undefined): SiteConfig {
  const base = structuredClone(DEFAULT_SITE_CONFIG);
  if (!partial) return base;

  return {
    ...base,
    ...partial,
    owner: { ...base.owner, ...partial.owner },
    location: { ...base.location, ...partial.location },
    policies: { ...base.policies, ...partial.policies },
    rooms: partial.rooms ?? base.rooms,
    booking: { ...base.booking, ...partial.booking },
    contact: { ...base.contact, ...partial.contact },
  };
}

/** Minimal validation: a site must be addressable and displayable. */
export function validateSiteConfig(config: SiteConfig): string[] {
  const errors: string[] = [];
  if (!config.siteName.trim()) errors.push("siteName is required");
  if (!config.location.city.trim() || !config.location.state.trim()) {
    errors.push("location.city and location.state are required");
  }
  if (config.booking.currency !== "MYR") {
    errors.push("booking.currency must be MYR");
  }
  for (const room of config.rooms) {
    if (room.baseRatePerNight < 0) errors.push(`room ${room.id}: baseRatePerNight cannot be negative`);
    if (room.capacity < 1) errors.push(`room ${room.id}: capacity must be at least 1`);
  }
  return errors;
}
