import type { SiteConfig } from "@/lib/config/site-config";

export function SiteRooms({ config }: { config: SiteConfig }) {
  if (config.rooms.length === 0) return null;

  return (
    <section id="rooms" className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
            Rooms &amp; Rates
          </h2>
          <p className="text-sm text-muted">Each stay is a quiet corner of the highlands.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {config.rooms.map((room) => (
            <article
              key={room.id}
              className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1.5 hover:border-gold/60"
            >
              {/* Photographic room band — synthetic demonstration placeholder */}
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(14,18,16,0.10), rgba(14,18,16,0.55)), url(/rooms-${room.id}.jpg)`,
                }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl text-foreground">{room.name}</h3>
                  <p className="whitespace-nowrap text-sm text-gold">
                    {config.booking.currency} {room.baseRatePerNight.toLocaleString()}
                    <span className="text-muted"> /night</span>
                  </p>
                </div>
                {room.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted">{room.description}</p>
                ) : null}
                <p className="mt-4 text-xs uppercase tracking-wider text-muted">
                  Sleeps {room.capacity} guest(s)
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
