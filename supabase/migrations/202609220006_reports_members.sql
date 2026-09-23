begin;
create function public.operational_report(p_actor uuid,p_since timestamptz,p_until timestamptz)
returns jsonb language plpgsql security definer set search_path=public as $$
declare m business_members; result jsonb;
begin
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin','receptionist');
 if m.user_id is null or p_until<=p_since or p_until-p_since>interval '366 days' then raise exception 'Invalid report request'; end if;
 select jsonb_build_object(
  'byCurrency',coalesce((select jsonb_object_agg(currency,total) from (select p.currency,sum(p.amount-p.refunded_amount) as total from payments p join appointments a on a.id=p.appointment_id where a.business_id=m.business_id and p.created_at>=p_since and p.created_at<p_until group by p.currency) q),'{}'::jsonb),
  'statuses',coalesce((select jsonb_object_agg(status,n) from(select status,count(*) as n from appointments where business_id=m.business_id and appointment_time>=p_since and appointment_time<p_until group by status) q),'{}'::jsonb),
  'appointmentCount',(select count(*) from appointments where business_id=m.business_id and appointment_time>=p_since and appointment_time<p_until),
  'providers',coalesce((select jsonb_agg(q) from(select s.name,count(*) as appointments from appointments a join staff_members s on s.id=a.staff_id where a.business_id=m.business_id and a.appointment_time>=p_since and a.appointment_time<p_until group by s.id,s.name)q),'[]'::jsonb),
  'services',coalesce((select jsonb_agg(q) from(select s.name,count(*) as appointments from appointments a join services s on s.id=a.service_id where a.business_id=m.business_id and a.appointment_time>=p_since and a.appointment_time<p_until group by s.id,s.name)q),'[]'::jsonb),
  'leadCount',(select count(*) from leads where business_id=m.business_id and created_at>=p_since and created_at<p_until),
  'converted',(select count(*) from leads where business_id=m.business_id and created_at>=p_since and created_at<p_until and status='converted')
 ) into result;
 return result;
end $$;
create function public.set_membership(p_actor uuid,p_user uuid,p_role text,p_staff uuid,p_active boolean)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members; old business_members;
begin
 select * into m from business_members where user_id=p_actor and is_active and role='owner';
 if m.user_id is null then raise exception 'Owner access required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 select * into old from business_members where user_id=p_user;
 if old.user_id is not null and old.business_id<>m.business_id then raise exception 'Member belongs to another business'; end if;
 if old.role='owner' and old.is_active and (p_role<>'owner' or not p_active) and (select count(*) from business_members where business_id=m.business_id and role='owner' and is_active)<=1 then raise exception 'Cannot disable the last owner'; end if;
 if p_staff is not null and not exists(select 1 from staff_members where id=p_staff and business_id=m.business_id) then raise exception 'Invalid staff'; end if;
 insert into business_members(user_id,business_id,role,staff_id,is_active) values(p_user,m.business_id,p_role,p_staff,p_active)
 on conflict(user_id) do update set role=excluded.role,staff_id=excluded.staff_id,is_active=excluded.is_active;
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_user,'membership_updated');
end $$;
revoke all on function public.operational_report(uuid,timestamptz,timestamptz),public.set_membership(uuid,uuid,text,uuid,boolean) from public,anon,authenticated;
grant execute on function public.operational_report(uuid,timestamptz,timestamptz),public.set_membership(uuid,uuid,text,uuid,boolean) to service_role;
-- Never automatically re-send an SMS after a worker died with an unknown outcome.
create or replace function public.claim_outbox() returns setof public.outbox language plpgsql security definer set search_path=public as $$
begin
 update outbox set status='uncertain',last_error='Worker interrupted after message submission; review provider records.' where channel in ('sms','whatsapp') and status='processing' and locked_until<now();
 return query update outbox set status='processing',locked_until=now()+interval '5 minutes',attempts=attempts+1
 where id in (select id from outbox where ((status='pending' and available_at<=now()) or (status='processing' and locked_until<now())) and attempts<8 order by available_at for update skip locked limit 10) returning *;
end $$;
commit;
