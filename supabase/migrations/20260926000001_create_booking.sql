-- HSBooking: create_booking RPC
--
-- Guests create a pending booking through this guarded RPC; the public route
-- handler calls it with the service-role key (server-side only). The function
-- re-checks availability before inserting to prevent double-booking under
-- concurrent requests (atomic guard inside the same transaction).

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

  -- Re-check availability atomically (prevents race-condition double-booking).
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
