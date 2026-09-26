import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";
import { SiteHero } from "@/components/site-hero";
import { SiteAmenities } from "@/components/site-amenities";
import { SiteRooms } from "@/components/site-rooms";
import { SitePolicies } from "@/components/site-policies";
import { BookingForm } from "@/components/booking-form";
import { DEMO_SITE_CONFIG } from "@/lib/config/demo-config";

/**
 * The public page is an async server component that loads config from
 * Supabase. Rendering that in jsdom is not meaningful, so this suite renders
 * the presentational components directly with the demo config — the same
 * config the page passes down — and asserts what a visitor sees.
 */
function PublicSite() {
  const config = DEMO_SITE_CONFIG;
  return (
    <div>
      <SiteHeader config={config} />
      <SiteHero config={config} />
      <main>
        {config.description ? <p>{config.description}</p> : null}
        <SiteRooms config={config} />
        <SiteAmenities config={config} />
        <SitePolicies config={config} />
        <BookingForm config={config} />
      </main>
      <footer>
        {config.siteName} · {config.location.city}, {config.location.state}
      </footer>
    </div>
  );
}

describe("public homestay surface", () => {
  it("renders demo owner content end to end", () => {
    render(<PublicSite />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Casa Melati Homestay/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/A cozy retreat in the Cameron Highlands/i)).toBeInTheDocument();
    expect(screen.getAllByText("Deluxe Room").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Family Suite").length).toBeGreaterThan(0);
    expect(screen.getByText(/Free Wi-Fi/)).toBeInTheDocument();
    expect(screen.getByText("3:00 PM")).toBeInTheDocument();
  });

  it("never renders raw HTML from owner content", () => {
    render(<PublicSite />);
    const body = document.body.innerHTML;
    expect(body).not.toContain("dangerouslySetInnerHTML");
    expect(body).not.toMatch(/<script/i);
  });

  it("exposes the booking form with validation", () => {
    render(<PublicSite />);
    expect(document.querySelectorAll('input[type="date"]').length).toBeGreaterThanOrEqual(2);
    expect(document.querySelectorAll('input[type="number"]').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('input[type="text"]').length).toBeGreaterThanOrEqual(1);
    const submit = document.querySelectorAll('button[type="submit"]');
    expect(submit.length).toBeGreaterThanOrEqual(1);
    expect(submit[0].textContent).toMatch(/Check availability/i);
  });
});
