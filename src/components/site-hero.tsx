import type { SiteConfig } from "@/lib/config/site-config";

export function SiteHero({ config }: { config: SiteConfig }) {
  return (
    <section className="relative overflow-hidden bg-background text-foreground">
      {/* Photographic hero band — full-bleed, low-noise, subtle parallax. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(14,18,16,0.72), rgba(14,18,16,0.30) 42%, rgba(14,18,16,0.55)), url(/hero-tea-hills.jpg)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-28 sm:py-32 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-40">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.24em] text-gold">
            Cameron Highlands · {config.location.state}
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            {config.siteName}
          </h1>
          {config.tagline ? (
            <p className="mt-5 max-w-md text-lg text-muted">{config.tagline}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#book"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-gold"
            >
              Check availability
            </a>
            <a
              href="#rooms"
              className="rounded-full border border-line px-6 py-3 text-sm text-foreground transition-colors hover:border-gold"
            >
              View rooms
            </a>
          </div>
        </div>
        {/* Right rail: price / highlight card */}
        <div className="rounded-2xl border border-line bg-surface/70 p-7 backdrop-blur-sm">
          <p className="text-sm text-muted">
            {config.booking.currency}
            {config.rooms.length > 0
              ? " " + lowestRate(config).toLocaleString() + " /night"
              : ""}
          </p>
          <p className="mt-1 font-display text-2xl text-foreground">
            {config.rooms.length > 0 ? "from RM " + lowestRate(config).toLocaleString() : ""}
          </p>
          <p className="mt-3 text-sm text-muted">
            Free cancellation up to 7 days · Check-in {config.policies.checkInTime ?? "3:00 PM"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function lowestRate(config: SiteConfig): number {
  if (config.rooms.length === 0) return 0;
  return Math.min(...config.rooms.map((r) => r.baseRatePerNight));
}
