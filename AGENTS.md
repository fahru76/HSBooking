# HSBooking agent context

## Product

HSBooking is a reusable homestay website platform for independent Malaysian homestay owners. It provides a standard public-site framework whose content, branding, amenities, policies, availability, and booking settings can be configured per owner. It is not a unified marketplace in the initial scope.

## Stack

- Next.js App Router
- TypeScript
- Supabase for authentication, structured content, availability, and bookings
- npm for package management

## Commands

- `npm run dev` — local development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — test suite when added

## Rules

- Keep owner-configurable content data-driven; do not hard-code one homestay's identity into reusable components.
- Keep tenant/owner boundaries explicit in database queries and server actions.
- Never expose Supabase service-role credentials to the browser.
- Add tests for booking availability, owner isolation, and content fallbacks.
- Use existing design tokens before adding new styles.
- Keep changes narrow and verify build, lint, and tests before committing.
