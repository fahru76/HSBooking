import type { SiteConfig } from "@/lib/config/site-config";

export function SiteRooms({ config }: { config: SiteConfig }) {
  if (config.rooms.length === 0) return null;

  return (
    <section id="rooms" className="bg-white py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900">Rooms &amp; Rates</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {config.rooms.map((room) => (
            <article key={room.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-zinc-900">{room.name}</h3>
                  <p className="whitespace-nowrap text-sm font-medium text-emerald-700">
                    {config.booking.currency} {room.baseRatePerNight.toLocaleString()}
                    <span className="text-zinc-500"> /night</span>
                  </p>
                </div>
                {room.description ? (
                  <p className="mt-2 text-sm text-zinc-600">{room.description}</p>
                ) : null}
                <p className="mt-3 text-xs text-zinc-500">Sleeps {room.capacity} guest(s)</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
