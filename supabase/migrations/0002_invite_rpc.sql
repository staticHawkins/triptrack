-- TripTrack — Invite RPC
-- Allows a trip owner to add an existing user (by email) as a trip member.

create or replace function public.invite_to_trip(p_trip_id uuid, p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_is_owner boolean;
begin
  -- Verify caller is the trip owner
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
      and role = 'owner'
  ) into v_is_owner;

  if not v_is_owner then
    return 'not_owner';
  end if;

  -- Look up the invitee's profile
  select id into v_user_id from public.profiles where email = p_email limit 1;

  if v_user_id is null then
    return 'not_found';
  end if;

  -- Add them as a member (no-op if already a member)
  insert into public.trip_members (trip_id, user_id, role)
  values (p_trip_id, v_user_id, 'member')
  on conflict (trip_id, user_id) do nothing;

  return 'ok';
end;
$$;
