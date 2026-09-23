begin;
create function public.save_my_time_off(p_actor uuid,p_start timestamptz,p_end timestamptz,p_reason text)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members;
begin
 select * into m from business_members where user_id=p_actor and is_active;
 if m.staff_id is null or p_end<=p_start then raise exception 'Invalid request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 insert into staff_time_off(staff_id,starts_at,ends_at,reason) values(m.staff_id,p_start,p_end,p_reason);
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,m.staff_id,'personal_time_off');
end $$;
create function public.schedule_followup() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status is distinct from old.status and new.status in ('completed','no_show') then
  insert into outbox(appointment_id,event_type,channel,idempotency_key,available_at)
  select new.id,case new.status when 'completed' then 'review_request' else 'no_show_followup' end,c,new.id::text||':'||new.status||':followup:'||c,now()+interval '1 day'
  from unnest(array['email','sms']) c on conflict do nothing;
 end if;
 return new;
end $$;
create trigger appointment_followup after update of status on public.appointments for each row execute function public.schedule_followup();
revoke all on function public.save_my_time_off(uuid,timestamptz,timestamptz,text),public.schedule_followup() from public,anon,authenticated;
grant execute on function public.save_my_time_off(uuid,timestamptz,timestamptz,text),public.schedule_followup() to service_role;
commit;
