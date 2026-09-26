import { SiteHeader } from "@/components/site-header";
import { SiteHero } from "@/components/site-hero";
import { SiteAmenities } from "@/components/site-amenities";
import { SiteRooms } from "@/components/site-rooms";
import { SitePolicies } from "@/components/site-policies";
import { BookingForm } from "@/components/booking-form";
import { getPublicSiteConfig } from "@/lib/db/public-config";

/**
 * Public homestay page. Renders ONLY what the owner config provides, with
 * platform defaults when a field is missing. Owner strings render as plain
 * React children (auto-escaped); no raw HTML is ever injected from config.
 *
 * Config is loaded from the owner Supabase row (demo owner for now).
 * Includes JSON-LD structured data for search-engine rich results.
 */
export default async function Home() {
  const config = await getPublicSiteConfig();

  const lodgingLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: config.siteName,
    description: config.description ?? config.tagline ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.location.address,
      addressLocality: config.location.city,
      addressRegion: config.location.state,
      postalCode: config.location.postalCode,
      addressCountry: "MY",
    },
    telephone: config.contact.phone ?? config.owner.phone,
    email: config.contact.email ?? config.owner.email,
    priceRange: config.rooms.length
      ? `${Math.min(...config.rooms.map((r) => r.baseRatePerNight))}–${Math.max(
          ...config.rooms.map((r) => r.baseRatePerNight),
        )} ${config.booking.currency}`
      : undefined,
    amenityFeature: config.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
    })),
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lodgingLd),
        }}
      />
      <SiteHeader config={config} />
      <SiteHero config={config} />
      <main>
        {config.description ? (
          <section className="mx-auto max-w-6xl px-5 py-16">
            <p className="mx-auto max-w-3xl text-center font-display text-xl leading-9 text-muted sm:text-2xl sm:leading-10">
              {config.description}
            </p>
          </section>
        ) : null}
        <SiteRooms config={config} />
        <SiteAmenities config={config} />
        <SitePolicies config={config} />
        <BookingForm config={config} />
      </main>
      <footer className="border-t border-line py-10">
        <div className="mx-auto max-w-6xl px-5 text-center text-sm text-muted">
          {config.siteName} · {config.location.city}, {config.location.state}
        </div>
      </footer>
    </div>
  );
}
