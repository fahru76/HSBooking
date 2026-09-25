import { SiteHeader } from "@/components/site-header";
import { SiteHero } from "@/components/site-hero";
import { SiteAmenities } from "@/components/site-amenities";
import { SiteRooms } from "@/components/site-rooms";
import { SitePolicies } from "@/components/site-policies";
import { BookingForm } from "@/components/booking-form";
import { DEMO_SITE_CONFIG } from "@/lib/config/demo-config";

/**
 * Public homestay page. Renders ONLY what the owner config provides, with
 * platform defaults when a field is missing. Owner strings render as plain
 * React children (auto-escaped); no raw HTML is ever injected from config.
 *
 * The config source is DEMO_SITE_CONFIG until the Supabase slice replaces it
 * with a per-owner row read (loadSiteConfig).
 */
export default function Home() {
  const config = DEMO_SITE_CONFIG;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <SiteHeader config={config} />
      <SiteHero config={config} />
      <main>
        {config.description ? (
          <section className="mx-auto max-w-5xl px-4 py-12">
            <p className="text-base leading-7 text-zinc-700">{config.description}</p>
          </section>
        ) : null}
        <SiteRooms config={config} />
        <SiteAmenities config={config} />
        <SitePolicies config={config} />
        <BookingForm config={config} />
      </main>
      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-500">
          {config.siteName} · {config.location.city}, {config.location.state}
        </div>
      </footer>
    </div>
  );
}
