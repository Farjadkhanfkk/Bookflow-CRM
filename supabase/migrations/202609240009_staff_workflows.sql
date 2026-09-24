begin;

-- Notifications are private to their recipient. No public subscription exposes appointments.
create table public.staff_notifications (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses,
 user_id uuid not null references auth.users on delete cascade,
 appointment_id uuid references public.appointments,
 message text not null,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index staff_notifications_inbox on public.staff_notifications(user_id,created_at desc);
alter table public.staff_notifications enable row level security;
revoke all on public.staff_notifications from public,anon,authenticated;
grant select on public.staff_notifications to authenticated;
grant all on public.staff_notifications to service_role;
create policy inbox_self on public.staff_notifications for select to authenticated
using(user_id=auth.uid() and business_id=public.member_business());
alter table public.outbox add column recipient_user_id uuid references auth.users on delete cascade;

create or replace function public.set_membership(p_actor uuid,p_user uuid,p_role text,p_staff uuid,p_active boolean)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members; previous business_members;
begin
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin');
 if m.user_id is null then raise exception 'Administrator access required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 -- Recheck after the lock so concurrent account removal cannot retain authority.
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin');
 if m.user_id is null then raise exception 'Administrator access required'; end if;
 select * into previous from business_members where user_id=p_user;
 if previous.user_id is not null and previous.business_id<>m.business_id then raise exception 'Member belongs to another business'; end if;
 if m.role='admin' and (p_role in ('owner','admin') or previous.role in ('owner','admin')) then raise exception 'Only owners manage administrators'; end if;
 if previous.role='owner' and previous.is_active and (p_role<>'owner' or not p_active) and (select count(*) from business_members where business_id=m.business_id and role='owner' and is_active)<=1 then raise exception 'Cannot disable the last owner'; end if;
 if p_staff is not null and not exists(select 1 from staff_members where id=p_staff and business_id=m.business_id) then raise exception 'Invalid staff'; end if;
 if p_staff is not null and p_active and exists(select 1 from business_members where staff_id=p_staff and user_id<>p_user and is_active) then raise exception 'Provider already linked to another account'; end if;
 insert into business_members(user_id,business_id,role,staff_id,is_active) values(p_user,m.business_id,p_role,p_staff,p_active)
 on conflict(user_id) do update set role=excluded.role,staff_id=excluded.staff_id,is_active=excluded.is_active;
 if not p_active and previous.staff_id is not null then
  update staff_members set is_bookable=false where id=previous.staff_id;
 end if;
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_user,'membership_updated');
end $$;

-- Find existing accounts by exact email inside the trusted database, never from client metadata.
create function public.link_team_member(p_actor uuid,p_email text,p_role text,p_staff uuid,p_name text)
returns uuid language plpgsql security definer set search_path=public as $$
declare m business_members; target uuid; provider uuid:=p_staff;
begin
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin');
 if m.user_id is null then raise exception 'Administrator access required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 select id into target from auth.users where lower(email)=lower(trim(p_email));
 if target is null then raise exception 'Account not found'; end if;
 if provider is null and p_role='staff' then
  select staff_id into provider from business_members where user_id=target and business_id=m.business_id;
  if provider is null then
   if length(trim(p_name))<2 then raise exception 'Provider name required'; end if;
   insert into staff_members(name,business_id,is_bookable) values(trim(p_name),m.business_id,false) returning id into provider;
  end if;
 end if;
 perform set_membership(p_actor,target,p_role,provider,true);
 return target;
end $$;

create function public.notify_staff_appointment() returns trigger language plpgsql security definer set search_path=public as $$
declare recipient business_members; notice text; notification uuid; previous_staff uuid;
begin
 if TG_OP='UPDATE' then
  if (new.staff_id,new.appointment_time,new.status) is not distinct from (old.staff_id,old.appointment_time,old.status) then return new; end if;
  previous_staff:=old.staff_id;
 end if;
 notice:=case when TG_OP='INSERT' then 'New appointment assigned.' else 'Appointment updated: '||replace(new.status,'_',' ')||'.' end;
 for recipient in select * from business_members where business_id=new.business_id and is_active and (role in ('owner','admin') or staff_id=new.staff_id or staff_id=previous_staff) loop
  insert into staff_notifications(business_id,user_id,appointment_id,message)
  values(new.business_id,recipient.user_id,new.id,case when recipient.staff_id=previous_staff and previous_staff is distinct from new.staff_id and recipient.role='staff' then 'An appointment was reassigned away from you.' else notice end) returning id into notification;
  insert into outbox(appointment_id,event_type,channel,idempotency_key,recipient_user_id)
  values(new.id,'staff_appointment_update','staff_email','staff-notice:'||notification,recipient.user_id);
 end loop;
 return new;
end $$;
create trigger staff_appointment_alert after insert or update on public.appointments for each row execute function public.notify_staff_appointment();

-- Dates are interpreted in the business timezone; an end date is inclusive, including DST days.
create function public.set_my_unavailable(p_actor uuid,p_from date,p_through date,p_reason text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare m business_members; tz text; start_at timestamptz; end_at timestamptz; conflicts integer; block_id uuid;
begin
 select * into m from business_members where user_id=p_actor and is_active;
 if m.staff_id is null or p_from is null or p_through is null or p_through<p_from or p_through-p_from>365 then raise exception 'Invalid time off'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 select timezone into tz from businesses where id=m.business_id;
 start_at:=p_from::timestamp at time zone tz; end_at:=(p_through+1)::timestamp at time zone tz;
 if end_at<=now() then raise exception 'Choose today or a future date'; end if;
 insert into staff_time_off(staff_id,starts_at,ends_at,reason) values(m.staff_id,start_at,end_at,left(p_reason,500)) returning id into block_id;
 select count(*) into conflicts from appointments where staff_id=m.staff_id and lower(status) in ('confirmed','checked_in','in_progress','pending_payment') and tstzrange(blocked_start,blocked_end,'[)') && tstzrange(start_at,end_at,'[)');
 insert into staff_notifications(business_id,user_id,message)
 select m.business_id,user_id,(select name from staff_members where id=m.staff_id)||' marked unavailable from '||p_from||' through '||p_through||'. Existing appointments to review: '||conflicts||'.'
 from business_members where business_id=m.business_id and is_active and role in ('owner','admin');
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,block_id,'personal_time_off');
 return jsonb_build_object('id',block_id,'conflicts',conflicts);
end $$;
create function public.remove_my_unavailable(p_actor uuid,p_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members;
begin
 select * into m from business_members where user_id=p_actor and is_active;
 if m.staff_id is null then raise exception 'Provider access required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 delete from staff_time_off where id=p_id and staff_id=m.staff_id;
 if not found then raise exception 'Time off not found'; end if;
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_id,'personal_time_off_removed');
end $$;
revoke all on function public.link_team_member(uuid,text,text,uuid,text),public.notify_staff_appointment(),public.set_my_unavailable(uuid,date,date,text),public.remove_my_unavailable(uuid,uuid) from public,anon,authenticated;
grant execute on function public.link_team_member(uuid,text,text,uuid,text),public.set_my_unavailable(uuid,date,date,text),public.remove_my_unavailable(uuid,uuid) to service_role;
commit;
