import type { SiteConfig } from "@/lib/config/site-config";

export function SiteAmenities({ config }: { config: SiteConfig }) {
  if (config.amenities.length === 0) return null;

  return (
    <section id="amenities" className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Amenities &amp; Facilities</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {config.amenities.map((a) => (
          <li
            key={a}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700"
          >
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}
