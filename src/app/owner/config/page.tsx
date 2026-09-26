"use client";

import { useEffect, useState } from "react";
import { DEMO_SITE_CONFIG } from "@/lib/config/demo-config";
import type { SiteConfig } from "@/lib/config/site-config";

const DEMO_OWNER_ID = "00000000-0000-0000-0000-000000000000";

export default function OwnerConfigPage() {
  const [config, setConfig] = useState<SiteConfig>(DEMO_SITE_CONFIG);
  const [status, setStatus] = useState("Loading demo owner config…");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/config?ownerId=${DEMO_OWNER_ID}`)
      .then(async (response) => {
        const data = (await response.json()) as { config?: SiteConfig; error?: string };
        if (!active) return;
        if (response.ok && data.config) {
          setConfig(data.config);
          setStatus("Loaded from Supabase");
        } else if (response.status === 503) {
          setStatus("Demo mode · Supabase is not configured");
        } else {
          setStatus(data.error ?? "Could not load config");
        }
      })
      .catch(() => {
        if (active) setStatus("Demo mode · could not reach Supabase");
      });
    return () => {
      active = false;
    };
  }, []);

  function update(patch: Partial<SiteConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  async function save() {
    setSaving(true);
    setStatus("Saving…");
    try {
      const response = await fetch(`/api/config?ownerId=${DEMO_OWNER_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setStatus(response.ok ? data.message ?? "Saved" : data.error ?? "Save failed");
    } catch {
      setStatus("Network error — changes were not saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gold">Owner studio</p>
            <h1 className="font-display text-4xl font-medium sm:text-5xl">Your homestay, your story.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Manage the content guests see on your public page. Every field is saved under this owner account.</p>
          </div>
          <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">{status}</span>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-5 font-display text-2xl">Property identity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Property name" value={config.siteName} onChange={(siteName) => update({ siteName })} />
              <Field label="Tagline" value={config.tagline ?? ""} onChange={(tagline) => update({ tagline })} />
              <label className="sm:col-span-2"><span className="mb-1 block text-sm font-medium">Description</span><textarea rows={4} value={config.description ?? ""} onChange={(e) => update({ description: e.target.value })} className="control" /></label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-5 font-display text-2xl">Location</h2>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Address" value={config.location.address} onChange={(address) => update({ location: { ...config.location, address } })} /><Field label="City" value={config.location.city} onChange={(city) => update({ location: { ...config.location, city } })} /><Field label="State" value={config.location.state} onChange={(state) => update({ location: { ...config.location, state } })} /><Field label="Postal code" value={config.location.postalCode ?? ""} onChange={(postalCode) => update({ location: { ...config.location, postalCode } })} /></div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-5 font-display text-2xl">Guest-facing details</h2>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Owner name" value={config.owner.name} onChange={(name) => update({ owner: { ...config.owner, name } })} /><Field label="Contact email" value={config.contact.email ?? ""} onChange={(email) => update({ contact: { ...config.contact, email } })} /><Field label="Phone" value={config.contact.phone ?? ""} onChange={(phone) => update({ contact: { ...config.contact, phone } })} /><Field label="Amenities (one per line)" value={config.amenities.join("\n")} onChange={(value) => update({ amenities: value.split("\n").map((item) => item.trim()).filter(Boolean) })} multiline /></div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-5 font-display text-2xl">Booking settings</h2>
            <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Minimum nights" value={config.booking.minNights ?? 1} onChange={(minNights) => update({ booking: { ...config.booking, minNights } })} /><NumberField label="Maximum guests" value={config.booking.maxGuests ?? 1} onChange={(maxGuests) => update({ booking: { ...config.booking, maxGuests } })} /><Field label="Check-in time" value={config.policies.checkInTime ?? ""} onChange={(checkInTime) => update({ policies: { ...config.policies, checkInTime } })} /></div>
          </section>
        </div>

        <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur"><span className="text-sm text-muted">Changes affect your public page after saving.</span><button type="button" onClick={save} disabled={saving} className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-gold disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button></div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{label}</span>{multiline ? <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="control" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="control" />}</label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium">{label}</span><input type="number" min={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="control" /></label>;
}
