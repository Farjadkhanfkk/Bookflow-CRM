-- Additive baseline for the existing single-business BookFlow installation.
-- Review on a restored/staging database first. No live data is deleted.
begin;
create extension if not exists btree_gist;
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(), name text not null,
  timezone text not null default 'America/Los_Angeles', currency text not null default 'usd',
  notice_hours integer not null default 4 check (notice_hours >= 0),
  horizon_days integer not null default 90 check (horizon_days between 1 and 365),
  cancellation_hours integer not null default 24 check (cancellation_hours >= 0),
  interval_minutes integer not null default 15 check (interval_minutes between 5 and 60)
);
insert into public.businesses(id,name) values ('00000000-0000-4000-8000-000000000001','Lumina Med Spa') on conflict do nothing;
create table if not exists public.services (id uuid primary key default gen_random_uuid(), name text not null, price text, category text, duration_minutes integer not null default 60);
alter table public.services add column if not exists business_id uuid references public.businesses default '00000000-0000-4000-8000-000000000001';
alter table public.services add column if not exists slug text;
alter table public.services add column if not exists duration_minutes integer not null default 60;
alter table public.services add column if not exists preparation_minutes integer not null default 0;
alter table public.services add column if not exists cleanup_minutes integer not null default 0;
alter table public.services add column if not exists price_amount integer not null default 0;
alter table public.services add column if not exists deposit_amount integer not null default 0;
-- Fail closed: imported services must have commercial values reviewed before opening bookings.
alter table public.services add column if not exists is_active boolean not null default false;
alter table public.services add constraint services_commercial_values check (price_amount >= 0 and deposit_amount between 0 and price_amount and duration_minutes between 5 and 480 and preparation_minutes between 0 and 120 and cleanup_minutes between 0 and 120);
create table if not exists public.staff_members (id uuid primary key default gen_random_uuid(), name text not null, title text, role text);
alter table public.staff_members add column if not exists business_id uuid references public.businesses default '00000000-0000-4000-8000-000000000001';
alter table public.staff_members add column if not exists is_bookable boolean not null default false;
create table public.business_members (
  user_id uuid primary key references auth.users on delete cascade,
  business_id uuid not null references public.businesses,
  staff_id uuid references public.staff_members,
  role text not null check (role in ('owner','admin','receptionist','staff')),
  is_active boolean not null default true,
  check (role <> 'staff' or staff_id is not null)
);
create table public.locations (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses,
  name text not null, address text not null default '', timezone text not null default 'America/Los_Angeles',
  is_active boolean not null default false
);
create table public.staff_services (staff_id uuid references public.staff_members, service_id uuid references public.services, primary key(staff_id,service_id));
create table public.staff_locations (staff_id uuid references public.staff_members, location_id uuid references public.locations, primary key(staff_id,location_id));
create table public.location_hours (
  id uuid primary key default gen_random_uuid(), location_id uuid not null references public.locations,
  weekday integer not null check (weekday between 0 and 6), opens time not null, closes time not null, check (opens < closes)
);
create table public.staff_availability (
  id uuid primary key default gen_random_uuid(), staff_id uuid not null references public.staff_members,
  location_id uuid not null references public.locations, weekday integer not null check (weekday between 0 and 6),
  opens time not null, closes time not null, check (opens < closes)
);
-- Split weekly availability into intervals to represent recurring breaks.
create table public.staff_time_off (
  id uuid primary key default gen_random_uuid(), staff_id uuid not null references public.staff_members,
  starts_at timestamptz not null, ends_at timestamptz not null, reason text, check (ends_at > starts_at)
);
create table public.external_busy_blocks (
  id uuid primary key default gen_random_uuid(), staff_id uuid not null references public.staff_members,
  starts_at timestamptz not null, ends_at timestamptz not null, check (ends_at > starts_at)
);
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), full_name text not null, email text, phone text, created_at timestamptz not null default now());
alter table public.customers add column if not exists business_id uuid references public.businesses default '00000000-0000-4000-8000-000000000001';
alter table public.customers add column if not exists notes text;
alter table public.customers add column if not exists email_consent boolean not null default false;
alter table public.customers add column if not exists sms_consent boolean not null default false;
-- Serialize matching in the booking function, rather than deleting/merging existing duplicate customers.
create index customers_business_email on public.customers(business_id,lower(email));
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers,
  service_id uuid references public.services, staff_id uuid references public.staff_members,
  appointment_time timestamptz not null, duration_minutes integer not null default 60,
  status text not null default 'confirmed', payment_status text not null default 'pending', notes text
);
alter table public.appointments add column if not exists business_id uuid references public.businesses default '00000000-0000-4000-8000-000000000001';
alter table public.appointments add column if not exists location_id uuid references public.locations;
alter table public.appointments add column if not exists duration_minutes integer not null default 60;
alter table public.appointments add column if not exists payment_status text not null default 'pending';
alter table public.appointments add column if not exists notes text;
alter table public.appointments add column if not exists customer_notes text;
alter table public.appointments add column if not exists price_amount integer not null default 0;
alter table public.appointments add column if not exists deposit_amount integer not null default 0;
alter table public.appointments add column if not exists currency text not null default 'usd';
alter table public.appointments add column if not exists service_name_snapshot text;
alter table public.appointments add column if not exists blocked_start timestamptz;
alter table public.appointments add column if not exists blocked_end timestamptz;
alter table public.appointments add column if not exists manage_token_hash text;
alter table public.appointments add column if not exists manage_expires_at timestamptz;
alter table public.appointments add column if not exists created_at timestamptz not null default now();
-- Existing overlap causes a deliberate migration failure; reconcile it rather than dropping bookings.
update public.appointments set blocked_start=appointment_time, blocked_end=appointment_time+make_interval(mins=>duration_minutes) where blocked_start is null;
alter table public.appointments add constraint appointments_no_overlap exclude using gist (staff_id with =, tstzrange(blocked_start,blocked_end,'[)') with &&) where (lower(status) in ('confirmed','checked_in','in_progress','pending_payment'));
create table public.booking_holds (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses,
  service_id uuid not null references public.services, location_id uuid not null references public.locations,
  staff_id uuid not null references public.staff_members, starts_at timestamptz not null, ends_at timestamptz not null,
  blocked_start timestamptz not null, blocked_end timestamptz not null, token_hash text not null,
  expires_at timestamptz not null default now()+interval '45 minutes', status text not null default 'active' check(status in ('active','converted','expired','cancelled')),
  price_amount integer not null, deposit_amount integer not null, currency text not null, service_name text not null,
  customer jsonb, checkout_session_id text unique, appointment_id uuid unique references public.appointments,
  reschedule_id uuid references public.appointments, created_at timestamptz not null default now()
);
create index holds_conflicts on public.booking_holds(staff_id,expires_at) where status='active';
create table public.payments (
  id uuid primary key default gen_random_uuid(), appointment_id uuid references public.appointments,
  checkout_session_id text unique, payment_intent_id text unique, amount integer not null,
  refunded_amount integer not null default 0, currency text not null, status text not null,
  created_at timestamptz not null default now()
);
create table public.stripe_webhook_events (id text primary key, event_type text not null, created_at timestamptz not null default now());
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), business_id uuid references public.businesses,
  actor_id uuid, entity_id uuid, action text not null, created_at timestamptz not null default now()
);
create table public.outbox (
  id uuid primary key default gen_random_uuid(), appointment_id uuid references public.appointments,
  event_type text not null, channel text not null, idempotency_key text not null unique,
  status text not null default 'pending', attempts integer not null default 0,
  available_at timestamptz not null default now(), locked_until timestamptz,
  provider_id text, last_error text, created_at timestamptz not null default now()
);
create table public.google_calendar_connections (
  staff_id uuid primary key references public.staff_members, encrypted_refresh_token text not null,
  calendar_id text not null default 'primary', synced_at timestamptz
);
create table public.leads (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses,
  full_name text not null, email text not null, phone text, message text,
  status text not null default 'new' check(status in ('new','contacted','qualified','appointment_booked','converted','lost')),
  assigned_to uuid references public.business_members(user_id), customer_id uuid references public.customers,
  appointment_id uuid references public.appointments, created_at timestamptz not null default now()
);
create table public.lead_activities (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads, actor_id uuid, description text not null, created_at timestamptz not null default now());
create table public.tasks (
  id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses,
  lead_id uuid references public.leads, customer_id uuid references public.customers,
  assigned_to uuid references public.business_members(user_id), title text not null,
  due_at timestamptz, status text not null default 'open' check(status in ('open','completed')),
  created_at timestamptz not null default now()
);
create table public.rate_limits (key text primary key, window_start timestamptz not null default now(), attempts integer not null default 1);

-- All authorization helpers use a fixed search_path and never trust user metadata.
create function public.member_role() returns text language sql stable security definer set search_path=public as $$
  select role from business_members where user_id=auth.uid() and is_active
$$;
create function public.member_business() returns uuid language sql stable security definer set search_path=public as $$
  select business_id from business_members where user_id=auth.uid() and is_active
$$;
create function public.member_staff() returns uuid language sql stable security definer set search_path=public as $$
  select staff_id from business_members where user_id=auth.uid() and is_active
$$;
-- Replace old policies on managed tables, including legacy public PII policies.
do $$ declare t text; p record; begin
  foreach t in array array['businesses','business_members','locations','services','staff_members','staff_services','staff_locations','location_hours','staff_availability','staff_time_off','external_busy_blocks','customers','appointments','booking_holds','payments','stripe_webhook_events','audit_logs','outbox','google_calendar_connections','leads','lead_activities','tasks','rate_limits'] loop
    execute format('alter table public.%I enable row level security',t);
    for p in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy %I on public.%I',p.policyname,t);
    end loop;
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant select on public.business_members,public.businesses,public.services,public.staff_members,public.locations,public.customers,public.appointments,public.payments,public.leads,public.tasks,public.lead_activities,public.audit_logs to authenticated;
create policy membership_self on public.business_members for select to authenticated using(user_id=auth.uid());
create policy business_read on public.businesses for select to authenticated using(id=public.member_business());
create policy services_read on public.services for select to authenticated using(business_id=public.member_business());
create policy staff_read on public.staff_members for select to authenticated using(business_id=public.member_business());
create policy locations_read on public.locations for select to authenticated using(business_id=public.member_business());
create policy appointments_read on public.appointments for select to authenticated using(business_id=public.member_business() and (public.member_role() in ('owner','admin','receptionist') or staff_id=public.member_staff()));
create policy customers_read on public.customers for select to authenticated using(business_id=public.member_business() and (public.member_role() in ('owner','admin','receptionist') or exists(select 1 from public.appointments a where a.customer_id=customers.id and a.staff_id=public.member_staff())));
create policy payments_read on public.payments for select to authenticated using(public.member_role() in ('owner','admin','receptionist') and exists(select 1 from public.appointments a where a.id=payments.appointment_id and a.business_id=public.member_business()));
create policy leads_read on public.leads for select to authenticated using(business_id=public.member_business() and public.member_role() in ('owner','admin','receptionist'));
create policy tasks_read on public.tasks for select to authenticated using(business_id=public.member_business() and (public.member_role() in ('owner','admin','receptionist') or assigned_to=auth.uid()));
create policy activities_read on public.lead_activities for select to authenticated using(exists(select 1 from public.leads l where l.id=lead_id));
create policy audit_read on public.audit_logs for select to authenticated using(business_id=public.member_business() and public.member_role() in ('owner','admin'));
commit;
