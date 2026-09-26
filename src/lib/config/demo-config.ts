import type { SiteConfig } from "@/lib/config/site-config";

/**
 * A representative owner configuration used to drive the public page during
 * development (data-driven scaffold). It is NOT a hard-coded product identity:
 * every value here is a sample of what a real owner would supply through the
 * future owner-management surface palace.
 *
 * Replace at the Supabase slice with a row read from site_configs.
 */
export const DEMO_SITE_CONFIG: SiteConfig = {
  siteName: "Casa Melati Homestay",
  tagline: "A cozy retreat in the Cameron Highlands",
  description:
    "A family-friendly homestay surrounded by rolling tea plantations and cool mountain air. Fully furnished, halal-friendly kitchen, and free parking.",
  owner: {
    id: "00000000-0000-0000-0000-000000000000",
    name: "Aina Rahman",
    phone: "+60 12-345 6789",
    email: "stay@casamelati.my",
    whatsapp: "60123456789",
  },
  location: {
    address: "12 Jalan Bukit Cemara, Brinchang",
    city: "Cameron Highlands",
    state: "Pahang",
    postalCode: "39100",
  },
  amenities: [
    "Free Wi-Fi",
    "Air conditioning",
    "Fully equipped kitchen",
    "Free parking",
    "Halal-friendly",
    "Mountain view balcony",
  ],
  policies: {
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    houseRules: [
      "No smoking inside the homestay",
      "Quiet hours after 11 PM",
      "Pets allowed with prior notice",
    ],
    cancellation: "Free cancellation up to 7 days before check-in.",
  },
  rooms: [
    {
      id: "deluxe",
      name: "Deluxe Room",
      description: "King bed, private bathroom, balcony with tea-plantation view.",
      capacity: 2,
      baseRatePerNight: 220,
      photos: [],
    },
    {
      id: "family",
      name: "Family Suite",
      description: "Two bedrooms, living area, sleeps a family of four comfortably.",
      capacity: 4,
      baseRatePerNight: 380,
      photos: [],
    },
  ],
  booking: {
    currency: "MYR",
    minNights: 1,
    maxGuests: 6,
    blockedDates: [],
    blockCheckInWeekdays: [],
  },
  contact: {
    email: "stay@casamelati.my",
    phone: "+60 12-345 6789",
  },
};
