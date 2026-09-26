import type { SiteConfig } from "@/lib/config/site-config";

export function SiteAmenities({ config }: { config: SiteConfig }) {
  if (config.amenities.length === 0) return null;

  return (
    <section id="amenities" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="mb-8 font-display text-3xl font-medium text-foreground sm:text-4xl">
        Amenities &amp; Facilities
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {config.amenities.map((a) => (
          <li
            key={a}
            className="rounded-xl border border-line bg-surface px-5 py-4 text-sm text-muted transition-colors hover:border-gold/60 hover:text-foreground"
          >
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}
