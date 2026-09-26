# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 App Router (React 19, TypeScript, Tailwind CSS 4). State/domain: pure TS modules. Tests: Vitest + local Supabase CLI / mock Supabase. Deploy target: GitHub Pages (static export) is the stated platform for sibling projects; HSBooking's CI runs lint+build on main with no deploy step yet (deployment target undecided — inference).

## Users

- **Guests**: people browsing a homestay's public page to decide whether to stay and to request a booking. Mobile-first browsing, short attention, price/availability-driven.
- **Owners** (future slice): homestay operators who configure their own site content. The public booking form is the guest-facing transaction surface.

## Product Purpose

Let each Malaysian homestay owner present a polished, per-owner configurable public website and capture booking requests. One deployment = one owner; no marketplace in initial scope. Success = a guest lands, understands the stay, and submits a valid booking request.

## Positioning

An owner-configurable homestay presence: every visible string, room, policy, and amenity is data-driven from a per-owner `SiteConfig`, and booking availability is validated against real booking rules (min nights, capacity, blocked dates) — verified, not just decorative.

## Operating Context

Malaysian homestays (Cameron Highlands demo owner). Currency: MYR. Demo content includes check-in/out times, house rules, cancellation terms, contact detailscard. The public page is static-rendered; the booking form is client-side, bounded by the booking rules.

## Capabilities and Constraints

- Config-driven public surface; platform defaults for missing fields.
- Pure booking domain rules (`isRangeAvailable`, `validateStay`) with tested edge cases.
- RLS: anon reads site config; owner (auth.uid) writes; bookings never readable by anon (PII); availability via the `check_availability` RPC.
- Constraints: no raw HTML from owner content; no service-role key in the browser; owner isolation on all queries; input validation before persistence; dependency audit clean before merge.
- Undecided: deployment target, payment flow, real imagery vs placeholders, host locale.

## Brand Commitments

None confirmed beyond the demo owner identity ("Casa Melati Homestay"). The incumbent visual (emerald/teal gradient on zinc, rounded cards) is an implementation property, not a binding brand. The platform should feel warm, trustworthy, and premium but not boutique-gimmicky — inference from the hospitality domain, not a confirmed commitment.

## Evidence on Hand

- `src/lib/config/demo-config.ts` — the representative owner config.
- `src/lib/bookings/availability.ts` + tests — the verified booking rules.
- `supabase/migrations/20260926000000_init.sql` — applied to the local stack, RLS/RPC live-probed.
- Obsidian notes: `Fahru-Obs/HSBooking/HSBooking.md`, `Security.md`.

## Product Principles

1. **Config is king** — every visible string is data, never hard-coded into components.
2. **Secure by default** — RLS + owner isolation + no raw HTML + no secret keys in the browser.
3. **Verified execution** — tests and live-DB probes back claims, not vibes.
4. **Maintainable over clever** — boring, testable modules that another engineer can read fast.
5. **Warm hospitality tone** — the surface should feel like a welcoming homestay, not a SaaS dashboard.

## Accessibility & Inclusion

Not user-confirmed. Project conventions include focusable states, contrast on text, responsive layouts, and `prefers-reduced-motion` support (to be applied in the redesign) — inference, not a stated requirement.
