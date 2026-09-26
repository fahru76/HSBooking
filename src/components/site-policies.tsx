import type { SiteConfig } from "@/lib/config/site-config";

export function SitePolicies({ config }: { config: SiteConfig }) {
  const { policies, contact } = config;

  return (
    <section id="policies" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="mb-8 font-display text-3xl font-medium text-foreground sm:text-4xl">
        House Policies
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {policies.checkInTime ? (
          <p className="rounded-xl border border-line bg-surface px-5 py-4 text-sm text-muted">
            <strong className="text-foreground">Check-in:</strong> {policies.checkInTime}
          </p>
        ) : null}
        {policies.checkOutTime ? (
          <p className="rounded-xl border border-line bg-surface px-5 py-4 text-sm text-muted">
            <strong className="text-foreground">Check-out:</strong> {policies.checkOutTime}
          </p>
        ) : null}
      </div>
      {policies.houseRules && policies.houseRules.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {policies.houseRules.map((rule) => (
            <li key={rule} className="text-sm text-muted">
              <span className="mr-2 text-gold">•</span> {rule}
            </li>
          ))}
        </ul>
      ) : null}
      {policies.cancellation ? (
        <p className="mt-5 text-sm text-muted">{policies.cancellation}</p>
      ) : null}
      {contact.email || contact.phone ? (
        <p className="mt-7 text-sm text-muted">
          Contact: {[contact.email, contact.phone].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
