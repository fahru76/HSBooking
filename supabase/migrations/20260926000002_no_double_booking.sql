-- HSBooking: prevent double-booking at the database level.
--
-- The `create_booking` RPC re-checks availability before inserting, but a
-- check-then-insert pair is not atomic: two concurrent requests for the same
-- dates can both pass the check and both insert. This migration closes the
-- race with a database-level guarantee.
--
-- Approach: an EXCLUDE constraint with a GiST index over a daterange per
-- (owner_id, room_id), scoped to active bookings only. Postgres evaluates the
-- exclusion inside the INSERT statement's own constraint check, so two
-- transactions cannot both commit overlapping active stays — whichever
-- commits second fails with a unique/exclusion violation instead of silently
-- double-booking.
--
-- Requires the btree_gist extension so uuid/text key columns can participate
-- in a GiST exclusion constraint alongside the range column.

create extension if not exists btree_gist;

alter table public.bookings drop constraint if exists bookings_no_double_booking;

-- Only pending/confirmed bookings block dates; cancelled ones must not.
alter table public.bookings
  add constraint bookings_no_double_booking
  exclude using gist (
    owner_id with =,
    room_id with =,
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending', 'confirmed'));

-- Keep the plain lookup index for the availability RPC's SELECT path
-- (the exclusion index serves correctness, not read performance).
create index if not exists bookings_owner_room_status_idx
  on public.bookings (owner_id, room_id, status);
