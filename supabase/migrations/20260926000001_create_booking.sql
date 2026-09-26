-- HSBooking: create_booking RPC
--
-- Guests create a pending booking through this guarded RPC; the public route
-- handler calls it with the service-role key (server-side only). The function
-- re-checks availability before inserting. A database-level exclusion
-- constraint (see 20260926000002_no_double_booking.sql) is the final
-- race-condition guard: if two concurrent requests pass the check-then-insert
-- window, Postgres rejects whichever commits second with a 23P01 exclusion
-- violation, which we translate to the 'unavailable' error code below.

create or replace function public.create_booking(
  p_owner_id    uuid,
  p_room_id     text,
  p_check_in    date,
  p_check_out   date,
  p_guests      integer,
  p_guest_name  text,
  p_guest_email text default null,
  p_guest_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id        uuid;
  v_available boolean;
begin
  -- Parameter guards.
  if p_owner_id is null or p_room_id is null
     or p_check_in is null or p_check_out is null
     or p_check_out <= p_check_in
     or p_guests is null or p_guests < 1
     or p_guest_name is null or trim(p_guest_name) = '' then
    raise exception 'invalid-params';
  end if;

  -- Re-check availability (catches the common case before hitting the
  -- exclusion constraint; the constraint is the backstop for races).
  v_available := public.check_availability(
    p_owner_id, p_room_id, p_check_in, p_check_out
  );

  if not v_available then
    raise exception 'unavailable';
  end if;

  insert into public.bookings (
    owner_id, room_id, check_in, check_out, guests,
    guest_name, guest_email, guest_phone, status
  ) values (
    p_owner_id, p_room_id, p_check_in, p_check_out, p_guests,
    p_guest_name, p_guest_email, p_guest_phone, 'pending'
  )
  returning id into v_id;

  return v_id;

exception
  -- The exclusion constraint (bookings_no_double_booking) raises 23P01
  -- when a concurrent transaction committed an overlapping active stay
  -- between our check and our insert. Translate it to the same error code
  -- the route handler already maps to HTTP 409.
  when exclusion_violation then
    raise exception 'unavailable';
end;
$$;

-- Only the server (service-role) should call this. Never expose a booking
-- creation primitive to anon/authenticated clients; the public route is the
-- validation boundary and the service-role key remains server-only.
revoke all on function public.create_booking(
  uuid, text, date, date, integer, text, text, text
) from public, anon, authenticated;
grant execute on function public.create_booking(
  uuid, text, date, date, integer, text, text, text
) to service_role;
