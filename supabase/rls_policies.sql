-- Supabase RLS migration: allow anon and authenticated roles to read services and staff_members
-- Paste this into the Supabase Dashboard → SQL Editor and run it.

-- Enable row level security on the tables (idempotent)
alter table if exists public.services enable row level security;
alter table if exists public.staff_members enable row level security;

-- Drop existing policies if they exist (safe re-run)
drop policy if exists "Allow public read services" on public.services;
drop policy if exists "Allow public read staff_members" on public.staff_members;
drop policy if exists "Allow authenticated read services" on public.services;
drop policy if exists "Allow authenticated read staff_members" on public.staff_members;

-- Policies for anon (unauthenticated) users
create policy "Allow anon read services"
  on public.services
  for select
  to anon
  using (true);

create policy "Allow anon read staff_members"
  on public.staff_members
  for select
  to anon
  using (true);

-- Policies for authenticated users
create policy "Allow authenticated read services"
  on public.services
  for select
  to authenticated
  using (true);

create policy "Allow authenticated read staff_members"
  on public.staff_members
  for select
  to authenticated
  using (true);
