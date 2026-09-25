import { describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_CONFIG,
  mergeSiteConfig,
  validateSiteConfig,
} from "@/lib/config/site-config";

describe("mergeSiteConfig", () => {
  it("returns safe defaults when no config is supplied", () => {
    const config = mergeSiteConfig(null);
    expect(config.siteName).toBe("Homestay Malaysia");
    expect(config.booking.currency).toBe("MYR");
    expect(config.rooms).toEqual([]);
    expect(config.policies).toEqual({});
  });

  it("merges owner values over defaults at every level", () => {
    const config = mergeSiteConfig({
      siteName: "Casa Melati",
      location: { address: "12 Jalan Bukit", city: "Cameron Highlands", state: "Pahang" },
      booking: { currency: "MYR", minNights: 2 },
      owner: { name: "Aina" },
    });
    expect(config.siteName).toBe("Casa Melati");
    expect(config.location.city).toBe("Cameron Highlands");
    expect(config.booking.minNights).toBe(2);
    expect(config.owner.name).toBe("Aina");
    // Nested defaults survive where the owner did not provide them.
    expect(config.booking.currency).toBe("MYR");
  });

  it("does not mutate the shared default object", () => {
    mergeSiteConfig({ siteName: "X", owner: { name: "Y" } });
    expect(DEFAULT_SITE_CONFIG.siteName).toBe("Homestay Malaysia");
    expect(DEFAULT_SITE_CONFIG.owner.name).toBe("Homestay Owner");
  });
});

describe("validateSiteConfig", () => {
  it("flags an empty site name", () => {
    const config = mergeSiteConfig({ siteName: " " });
    const errors = validateSiteConfig(config);
    expect(errors).toContain("siteName is required");
  });

  it("flags a negative room rate", () => {
    const config = mergeSiteConfig({
      siteName: "Villa",
      location: { address: "1", city: "Ipoh", state: "Perak" },
      rooms: [{ id: "a", name: "A", capacity: 2, baseRatePerNight: -5 }],
    });
    expect(validateSiteConfig(config)).toContain(
      "room a: baseRatePerNight cannot be negative",
    );
  });

  it("accepts a complete valid config", () => {
    const config = mergeSiteConfig({
      siteName: "Villa",
      location: { address: "1", city: "Ipoh", state: "Perak" },
      rooms: [{ id: "a", name: "A", capacity: 2, baseRatePerNight: 150 }],
    });
    expect(validateSiteConfig(config)).toEqual([]);
  });
});
