-- Allow trip co-members to read each other's profiles.
-- Without this, joining profiles via trip_members returns null for other
-- members, which breaks UI that displays member names (e.g. expense logging).
create policy "profiles_select_co_member" on public.profiles for select using (
  exists (
    select 1
    from public.trip_members tm_self
    join public.trip_members tm_other on tm_self.trip_id = tm_other.trip_id
    where tm_self.user_id = auth.uid()
      and tm_other.user_id = profiles.id
  )
);
