-- HSBooking: initial schema + RLS
--
-- Owner-scoped site configs and bookings for a multi-tenant homestay platform.
-- Security model:
--   * Anonymous gets read-only site config for the public page + a guarded
--     availability RPC. It never reads bookings directly (no guest PII).
--   * Writes are owner-only via auth.uid().
--   * No service-role key is ever used from the browser; anon key only.

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.site_configs (
  owner_id   uuid primary key references auth.users (id) on delete cascade,
  config     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,
  room_id     text not null,
  guest_name  text not null,
  guest_email text,
  guest_phone text,
  check_in    date not null,
  check_out   date not null,
  guests      integer not null default 1,
  status      text not null default 'pending'
              check (status in ('pending', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  constraint bookings_dates_sane check (check_out > check_in),
  constraint bookings_guests_sane check (guests >= 1)
);

create index if not exists bookings_owner_room_idx
  on public.bookings (owner_id, room_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists site_configs_set_updated_at on public.site_configs;
create trigger site_configs_set_updated_at
  before update on public.site_configs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.site_configs enable row level security;
alter table public.bookings enable row level security;

-- Public page needs the site's config, so anon may read it (intended:
-- the config IS the public content). Writes are owner-only.
create policy site_configs_public_read
  on public.site_configs for select
  using (true);

create policy site_configs_owner_write
  on public.site_configs for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Bookings carry guest PII; only the owner sees them. Guests create
-- bookings through the guarded RPC in a later slice, never by direct
-- insert against a PII-bearing row.
create policy bookings_owner_all
  on public.bookings for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- Availability RPC (security definer, pinned search_path, explicit grants)
-- ---------------------------------------------------------------------------

create or replace function public.check_availability(
  p_owner_id uuid,
  p_room_id  text,
  p_start    date,
  p_end      date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflicts integer;
begin
  if p_owner_id is null or p_room_id is null
     or p_start is null or p_end is null
     or p_end <= p_start then
    return false;
  end if;

  -- Any active booking overlapping the stay blocks the range
  -- (end-exclusive overlap semantics match the domain helpers).
  select count(*)
    into v_conflicts
    from public.bookings b
   where b.owner_id = p_owner_id
     and b.room_id  = p_room_id
     and b.status in ('pending', 'confirmed')
     and b.check_in  < p_end
     and b.check_out > p_start;

  -- Owner-blocked dates on the config also block availability.
  return v_conflicts = 0
     and not exists (
           select 1
             from jsonb_array_elements_text(
                    (select config #> '{booking,blockedDates}'
                       from public.site_configs sc
                      where sc.owner_id = p_owner_id)
                  ) as d(day)
            where d.day >= p_start::text
              and d.day <  p_end::text
         )
     and not exists (
           -- Owner-blocked check-in weekdays also block availability.
           select 1
             from jsonb_array_elements_text(
                    (select config #> '{booking,blockCheckInWeekdays}'
                       from public.site_configs sc
                      where sc.owner_id = p_owner_id)
                  ) as w(weekday)
            where w.weekday::int = extract(isodow from p_start)::int % 7
         );
end;
$$;

-- No role gets broad access to the function source; only EXECUTE for the
-- roles the public flows need. `revoke all` then `grant execute` is the
-- explicit-grants pattern this platform requires.
revoke all on function public.check_availability(uuid, text, date, date)
  from public, anon, authenticated;
grant execute on function public.check_availability(uuid, text, date, date)
  to anon, authenticated;

commit;
