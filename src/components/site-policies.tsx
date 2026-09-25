import type { SiteConfig } from "@/lib/config/site-config";

export function SitePolicies({ config }: { config: SiteConfig }) {
  const { policies, contact } = config;

  return (
    <section id="policies" className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-900">House Policies</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {policies.checkInTime ? (
          <p className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            <strong>Check-in:</strong> {policies.checkInTime}
          </p>
        ) : null}
        {policies.checkOutTime ? (
          <p className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            <strong>Check-out:</strong> {policies.checkOutTime}
          </p>
        ) : null}
      </div>
      {policies.houseRules && policies.houseRules.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {policies.houseRules.map((rule) => (
            <li key={rule} className="text-sm text-zinc-700">• {rule}</li>
          ))}
        </ul>
      ) : null}
      {policies.cancellation ? (
        <p className="mt-4 text-sm text-zinc-600">{policies.cancellation}</p>
      ) : null}
      {contact.email || contact.phone ? (
        <p className="mt-6 text-sm text-zinc-600">
          Contact: {[contact.email, contact.phone].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
