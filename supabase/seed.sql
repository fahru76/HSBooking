-- Seed a demo owner for E2E booking testing.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'demo@casamelati.my', crypt('demo12345', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.site_configs (owner_id, config)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '{"siteName":"Casa Melati","rooms":[{"id":"deluxe","name":"Deluxe Room","capacity":2,"baseRatePerNight":220}],"booking":{"currency":"MYR","minNights":1,"maxGuests":6,"blockedDates":[]}}'::jsonb
)
ON CONFLICT (owner_id) DO UPDATE SET config = EXCLUDED.config;
