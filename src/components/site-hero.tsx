import type { SiteConfig } from "@/lib/config/site-config";

export function SiteHero({ config }: { config: SiteConfig }) {
  return (
    <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 py-20 text-white">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{config.siteName}</h1>
        {config.tagline ? <p className="mt-4 text-lg text-emerald-50">{config.tagline}</p> : null}
        <p className="mt-6 inline-block rounded-full bg-white/15 px-5 py-2 text-sm">
          {config.location.city}, {config.location.state} · {config.booking.currency}{" "}
          {config.rooms.length > 0 ? "starting from " + lowestRate(config).toLocaleString() : ""}
        </p>
      </div>
    </section>
  );
}

export function lowestRate(config: SiteConfig): number {
  if (config.rooms.length === 0) return 0;
  return Math.min(...config.rooms.map((r) => r.baseRatePerNight));
}
