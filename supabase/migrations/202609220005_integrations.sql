begin;
create table public.oauth_states (
  state_hash text primary key, user_id uuid not null references auth.users,
  staff_id uuid not null references public.staff_members, expires_at timestamptz not null
);
create table public.appointment_calendar_events (
  appointment_id uuid primary key references public.appointments,
  staff_id uuid not null references public.staff_members, event_id text not null, calendar_id text not null
);
alter table public.oauth_states enable row level security;
alter table public.appointment_calendar_events enable row level security;
revoke all on public.oauth_states,public.appointment_calendar_events from anon,authenticated;
grant all on public.oauth_states,public.appointment_calendar_events to service_role;
alter table public.outbox add column hold_id uuid references public.booking_holds;
alter table public.payments add column hold_id uuid references public.booking_holds;
alter table public.customers add column whatsapp_consent boolean not null default false;
create function public.replace_external_busy(p_staff uuid,p_blocks jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare b uuid;
begin
 select business_id into b from staff_members where id=p_staff;
 perform pg_advisory_xact_lock(hashtextextended(b::text,0));
 delete from external_busy_blocks where staff_id=p_staff;
 insert into external_busy_blocks(staff_id,starts_at,ends_at)
 select p_staff,(value->>'start')::timestamptz,(value->>'end')::timestamptz from jsonb_array_elements(p_blocks);
 update google_calendar_connections set synced_at=now() where staff_id=p_staff;
end $$;
create function public.record_unfulfilled_payment(p_hold uuid,p_session text,p_intent text,p_amount integer,p_currency text,p_event text)
returns void language plpgsql security definer set search_path=public as $$
declare h booking_holds;
begin
 select * into h from booking_holds where id=p_hold;
 perform pg_advisory_xact_lock(hashtextextended(h.business_id::text,0));
 select * into h from booking_holds where id=p_hold for update;
 if h.id is null or h.checkout_session_id is distinct from p_session or h.deposit_amount is distinct from p_amount or h.currency is distinct from p_currency then raise exception 'Payment mismatch'; end if;
 if h.status='converted' then return; end if;
 update booking_holds set status='expired' where id=h.id;
 insert into payments(hold_id,checkout_session_id,payment_intent_id,amount,currency,status) values(h.id,p_session,p_intent,p_amount,p_currency,'refund_pending') on conflict(checkout_session_id) do nothing;
 insert into outbox(hold_id,event_type,channel,idempotency_key) values(h.id,'refund','stripe',h.id::text||':unfulfilled-refund') on conflict do nothing;
 insert into stripe_webhook_events(id,event_type) values(p_event,'checkout.unfulfilled') on conflict do nothing;
end $$;
revoke all on function public.replace_external_busy(uuid,jsonb),public.record_unfulfilled_payment(uuid,text,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.replace_external_busy(uuid,jsonb),public.record_unfulfilled_payment(uuid,text,text,integer,text,text) to service_role;
commit;
