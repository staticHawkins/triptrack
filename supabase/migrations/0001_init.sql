-- TripTrack — Initial Schema
-- Run this in the Supabase SQL Editor after creating your project.

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ────────────────────────────────────────────────────────────────────
create type public.category as enum (
  'Food', 'Transport', 'Lodging', 'Activities', 'Supplies', 'Other'
);

create type public.member_role as enum ('owner', 'member');

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- Profiles: mirrors auth.users, auto-populated via trigger below
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  display_name  text,
  created_at    timestamptz not null default now()
);

-- Trips
create table public.trips (
  id           uuid        primary key default uuid_generate_v4(),
  name         text        not null,
  destination  text        not null,
  start_date   date        not null,
  end_date     date        not null,
  created_by   uuid        references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- Per-category budgets (one row per category per trip)
create table public.category_budgets (
  id       uuid    primary key default uuid_generate_v4(),
  trip_id  uuid    not null references public.trips(id) on delete cascade,
  category public.category not null,
  amount   numeric(10, 2) not null default 0,
  unique (trip_id, category)
);

-- Trip members join table
create table public.trip_members (
  trip_id    uuid             not null references public.trips(id) on delete cascade,
  user_id    uuid             not null references public.profiles(id) on delete cascade,
  role       public.member_role not null default 'member',
  joined_at  timestamptz      not null default now(),
  primary key (trip_id, user_id)
);

-- Itinerary items
create table public.itinerary_items (
  id         uuid        primary key default uuid_generate_v4(),
  trip_id    uuid        not null references public.trips(id) on delete cascade,
  date       date        not null,
  time       time,
  title      text        not null,
  location   text,
  notes      text,
  created_at timestamptz not null default now()
);

-- Expenses
create table public.expenses (
  id                 uuid             primary key default uuid_generate_v4(),
  trip_id            uuid             not null references public.trips(id) on delete cascade,
  paid_by            uuid             references public.profiles(id) on delete set null,
  amount             numeric(10, 2)   not null,
  category           public.category  not null,
  description        text             not null,
  date               date             not null,
  itinerary_item_id  uuid             references public.itinerary_items(id) on delete set null,
  created_at         timestamptz      not null default now()
);

-- ─── Row Level Security ────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.trips           enable row level security;
alter table public.category_budgets enable row level security;
alter table public.trip_members    enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.expenses        enable row level security;

-- Helper: is the calling user a member of the given trip?
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
  );
$$;

-- Profiles: own row only
create policy "profiles_select_own"  on public.profiles for select  using (id = auth.uid());
create policy "profiles_insert_own"  on public.profiles for insert  with check (id = auth.uid());
create policy "profiles_update_own"  on public.profiles for update  using (id = auth.uid());

-- Trips: any authenticated user can create; members can read/update; owners can delete
create policy "trips_insert_auth"    on public.trips for insert with check (auth.role() = 'authenticated');
create policy "trips_select_member"  on public.trips for select  using (public.is_trip_member(id));
create policy "trips_update_member"  on public.trips for update  using (public.is_trip_member(id));
create policy "trips_delete_owner"   on public.trips for delete  using (
  exists (
    select 1 from public.trip_members
    where trip_id = id
      and user_id = auth.uid()
      and role = 'owner'
  )
);

-- Category budgets: trip members only
create policy "category_budgets_member" on public.category_budgets
  for all using (public.is_trip_member(trip_id));

-- Trip members: members can view; owners or self can insert (self-join when creating trip)
create policy "trip_members_select"       on public.trip_members for select using (public.is_trip_member(trip_id));
create policy "trip_members_insert_self"  on public.trip_members for insert with check (
  user_id = auth.uid()
  or exists (
    select 1 from public.trip_members tm
    where tm.trip_id = trip_members.trip_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);
create policy "trip_members_delete_owner" on public.trip_members for delete using (
  exists (
    select 1 from public.trip_members tm
    where tm.trip_id = trip_members.trip_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
  )
);

-- Itinerary items: trip members only
create policy "itinerary_items_member" on public.itinerary_items
  for all using (public.is_trip_member(trip_id));

-- Expenses: trip members only
create policy "expenses_member" on public.expenses
  for all using (public.is_trip_member(trip_id));

-- ─── Trigger: auto-create profile on first sign-up ────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
