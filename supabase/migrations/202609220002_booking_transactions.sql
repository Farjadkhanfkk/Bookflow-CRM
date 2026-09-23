begin;
create function public.slot_available(p_service uuid,p_location uuid,p_staff uuid,p_start timestamptz,p_ignore uuid default null)
returns boolean language plpgsql volatile security definer set search_path=public as $$
declare s services; l locations; b businesses; bs timestamptz; be timestamptz; local_start timestamp; local_end timestamp;
begin
 select * into s from services where id=p_service and is_active;
 select * into l from locations where id=p_location and is_active;
 if s.id is null or l.id is null or s.business_id<>l.business_id then return false; end if;
 select * into b from businesses where id=s.business_id;
 if p_start < now()+make_interval(hours=>b.notice_hours) or p_start>now()+make_interval(days=>b.horizon_days) then return false; end if;
 if not exists(select 1 from staff_members where id=p_staff and business_id=b.id and is_bookable) or
    not exists(select 1 from staff_services where staff_id=p_staff and service_id=s.id) or
    not exists(select 1 from staff_locations where staff_id=p_staff and location_id=l.id) then return false; end if;
 bs:=p_start-make_interval(mins=>s.preparation_minutes);
 be:=p_start+make_interval(mins=>s.duration_minutes+s.cleanup_minutes);
 local_start:=bs at time zone l.timezone; local_end:=be at time zone l.timezone;
 if local_start::date<>local_end::date or extract(second from p_start)<>0 or mod(extract(minute from p_start at time zone l.timezone)::integer,b.interval_minutes)<>0 then return false; end if;
 if not exists(select 1 from location_hours where location_id=l.id and weekday=extract(dow from local_start) and opens<=local_start::time and closes>=local_end::time) then return false; end if;
 if not exists(select 1 from staff_availability where staff_id=p_staff and location_id=l.id and weekday=extract(dow from local_start) and opens<=local_start::time and closes>=local_end::time) then return false; end if;
 if exists(select 1 from staff_time_off where staff_id=p_staff and starts_at<be and ends_at>bs) or
    exists(select 1 from external_busy_blocks where staff_id=p_staff and starts_at<be and ends_at>bs) or
    exists(select 1 from appointments where staff_id=p_staff and id is distinct from p_ignore and lower(status) in ('confirmed','checked_in','in_progress','pending_payment') and blocked_start<be and blocked_end>bs) or
    exists(select 1 from booking_holds where staff_id=p_staff and status='active' and expires_at>now() and blocked_start<be and blocked_end>bs) then return false; end if;
 return true;
end $$;
create function public.available_slots(p_service uuid,p_location uuid,p_staff uuid,p_date date,p_ignore uuid default null)
returns table(starts_at timestamptz,staff_id uuid) language sql volatile security definer set search_path=public as $$
 select distinct tick, st.id from locations l
 cross join lateral generate_series(p_date::timestamp at time zone l.timezone,(p_date+1)::timestamp at time zone l.timezone-interval '1 minute',interval '1 minute') tick
 join staff_members st on st.business_id=l.business_id
 where l.id=p_location and (p_staff is null or st.id=p_staff) and slot_available(p_service,p_location,st.id,tick,p_ignore)
 order by tick,st.id limit 300
$$;
create function public.create_booking_hold(p_service uuid,p_location uuid,p_staff uuid,p_start timestamptz,p_token text,p_reschedule uuid default null,p_manage_hash text default null)
returns public.booking_holds language plpgsql security definer set search_path=public as $$
declare s services; l locations; chosen uuid; h booking_holds; a appointments; b businesses;
begin
 select * into s from services where id=p_service and is_active;
 select * into l from locations where id=p_location and is_active;
 if s.id is null or l.id is null or s.business_id<>l.business_id then raise exception 'Invalid selection'; end if;
 perform pg_advisory_xact_lock(hashtextextended(s.business_id::text,0));
 if p_reschedule is not null then
   select * into a from appointments where id=p_reschedule and manage_token_hash=p_manage_hash and manage_expires_at>now() and status='confirmed' for update;
   select * into b from businesses where id=s.business_id;
   if a.id is null or a.service_id<>s.id or a.business_id<>s.business_id or a.appointment_time<now()+make_interval(hours=>b.cancellation_hours) then raise exception 'Rescheduling is unavailable'; end if;
 end if;
 select id into chosen from staff_members where business_id=s.business_id and (p_staff is null or id=p_staff) and slot_available(s.id,l.id,id,p_start,p_reschedule) order by id limit 1;
 if chosen is null then raise exception 'Slot no longer available'; end if;
 insert into booking_holds(business_id,service_id,location_id,staff_id,starts_at,ends_at,blocked_start,blocked_end,token_hash,price_amount,deposit_amount,currency,service_name,reschedule_id)
 select s.business_id,s.id,l.id,chosen,p_start,p_start+make_interval(mins=>s.duration_minutes),p_start-make_interval(mins=>s.preparation_minutes),p_start+make_interval(mins=>s.duration_minutes+s.cleanup_minutes),p_token,s.price_amount,s.deposit_amount,biz.currency,s.name,p_reschedule from businesses biz where biz.id=s.business_id returning * into h;
 return h;
end $$;
create function public.queue_appointment_event(p_id uuid,p_event text,p_key text)
returns void language plpgsql security definer set search_path=public as $$
begin
 insert into outbox(appointment_id,event_type,channel,idempotency_key)
 select p_id,p_event,c,p_key||':'||c from unnest(array['email','sms','google','n8n']) c on conflict(idempotency_key) do nothing;
end $$;
create function public.confirm_booking(p_hold uuid,p_token text,p_manage_hash text,p_session text default null,p_intent text default null,p_amount integer default null,p_currency text default null,p_event text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare h booking_holds; cid uuid; aid uuid; b businesses;
begin
 select * into h from booking_holds where id=p_hold;
 if h.id is null then raise exception 'Invalid hold'; end if;
 perform pg_advisory_xact_lock(hashtextextended(h.business_id::text,0));
 select * into h from booking_holds where id=p_hold for update;
 if h.token_hash<>p_token or h.reschedule_id is not null then raise exception 'Invalid hold'; end if;
 if h.status='converted' then return h.appointment_id; end if;
 if h.status<>'active' or h.expires_at<=now() or h.customer is null then raise exception 'Hold expired or incomplete'; end if;
 if h.deposit_amount>0 and (p_session is distinct from h.checkout_session_id or p_intent is null or p_amount is distinct from h.deposit_amount or p_currency is distinct from h.currency or p_event is null) then raise exception 'Payment mismatch'; end if;
 -- Exclude this hold while revalidating all business rules; rollback restores it on failure.
 update booking_holds set status='converted' where id=h.id;
 if not slot_available(h.service_id,h.location_id,h.staff_id,h.starts_at) then raise exception 'Booking rules changed; payment requires refund review'; end if;
 select id into cid from customers where business_id=h.business_id and lower(email)=lower(h.customer->>'email') order by id limit 1;
 if cid is null then
   insert into customers(business_id,full_name,email,phone,email_consent,sms_consent,whatsapp_consent) values(h.business_id,h.customer->>'name',lower(h.customer->>'email'),h.customer->>'phone',coalesce((h.customer->>'emailConsent')::boolean,false),coalesce((h.customer->>'smsConsent')::boolean,false),coalesce((h.customer->>'whatsappConsent')::boolean,false)) returning id into cid;
 end if;
 -- Matching an email must not overwrite the existing person's identity or consents.
 insert into appointments(business_id,location_id,customer_id,service_id,staff_id,appointment_time,duration_minutes,status,payment_status,price_amount,deposit_amount,currency,service_name_snapshot,blocked_start,blocked_end,manage_token_hash,manage_expires_at,customer_notes)
 values(h.business_id,h.location_id,cid,h.service_id,h.staff_id,h.starts_at,extract(epoch from h.ends_at-h.starts_at)::integer/60,'confirmed',case when h.deposit_amount=0 then 'not_required' else 'paid' end,h.price_amount,h.deposit_amount,h.currency,h.service_name,h.blocked_start,h.blocked_end,p_manage_hash,h.starts_at+interval '30 days',h.customer->>'notes') returning id into aid;
 update booking_holds set appointment_id=aid where id=h.id;
 if h.deposit_amount>0 then
   insert into payments(appointment_id,checkout_session_id,payment_intent_id,amount,currency,status) values(aid,p_session,p_intent,p_amount,p_currency,'paid');
   insert into stripe_webhook_events(id,event_type) values(p_event,'checkout.session.completed') on conflict do nothing;
 end if;
 insert into audit_logs(business_id,entity_id,action) values(h.business_id,aid,'booking_confirmed');
 perform queue_appointment_event(aid,'booking_confirmed',aid::text||':confirmed');
 insert into outbox(appointment_id,event_type,channel,idempotency_key,available_at)
 select aid,'reminder',channel,aid::text||':reminder:'||hours||':'||channel,h.starts_at-make_interval(hours=>hours)
 from unnest(array[24,2]) hours cross join unnest(array['email','sms']) channel where h.starts_at-make_interval(hours=>hours)>now() on conflict do nothing;
 return aid;
end $$;
create function public.manage_appointment(p_hash text,p_action text,p_hold uuid default null,p_hold_token text default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare a appointments; h booking_holds; b businesses;
begin
 select * into a from appointments where manage_token_hash=p_hash and manage_expires_at>now();
 if a.id is null then raise exception 'Invalid or expired booking link'; end if;
 perform pg_advisory_xact_lock(hashtextextended(a.business_id::text,0));
 select * into a from appointments where id=a.id for update;
 select * into b from businesses where id=a.business_id;
 if a.status<>'confirmed' or a.appointment_time<now()+make_interval(hours=>b.cancellation_hours) then raise exception 'Online changes are outside the booking policy'; end if;
 if p_action='cancel' then
   update appointments set status='cancelled' where id=a.id;
   -- Refund policy: eligible cancellations refund the captured deposit asynchronously.
   insert into outbox(appointment_id,event_type,channel,idempotency_key) values(a.id,'refund','stripe',a.id::text||':refund') on conflict do nothing;
 elsif p_action='reschedule' then
   select * into h from booking_holds where id=p_hold and token_hash=p_hold_token and reschedule_id=a.id and expires_at>now() and status='active' for update;
   if h.id is null then raise exception 'Invalid or expired replacement hold'; end if;
   update booking_holds set status='converted' where id=h.id;
   if not slot_available(h.service_id,h.location_id,h.staff_id,h.starts_at,a.id) then raise exception 'Replacement slot unavailable'; end if;
   update appointments set location_id=h.location_id,staff_id=h.staff_id,appointment_time=h.starts_at,duration_minutes=extract(epoch from h.ends_at-h.starts_at)::integer/60,blocked_start=h.blocked_start,blocked_end=h.blocked_end,manage_expires_at=h.starts_at+interval '30 days' where id=a.id;
 else raise exception 'Invalid action'; end if;
 update outbox set status='skipped' where appointment_id=a.id and event_type='reminder' and status='pending';
 if p_action='reschedule' then
   insert into outbox(appointment_id,event_type,channel,idempotency_key,available_at)
   select a.id,'reminder',channel,p_hold::text||':reminder:'||hours||':'||channel,h.starts_at-make_interval(hours=>hours)
   from unnest(array[24,2]) hours cross join unnest(array['email','sms']) channel where h.starts_at-make_interval(hours=>hours)>now();
 end if;
 insert into audit_logs(business_id,entity_id,action) values(a.business_id,a.id,p_action);
 perform queue_appointment_event(a.id,'booking_'||p_action,a.id::text||':'||p_action||':'||coalesce(p_hold::text,'once'));
 return a.id;
end $$;
create function public.take_rate_limit(p_key text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into rate_limits(key) values(p_key) on conflict(key) do update set
 attempts=case when rate_limits.window_start<now()-make_interval(secs=>p_seconds) then 1 else rate_limits.attempts+1 end,
 window_start=case when rate_limits.window_start<now()-make_interval(secs=>p_seconds) then now() else rate_limits.window_start end returning attempts into n;
 return n<=p_limit;
end $$;
create function public.claim_outbox() returns setof public.outbox language sql security definer set search_path=public as $$
 update outbox set status='processing',locked_until=now()+interval '5 minutes',attempts=attempts+1
 where id in (select id from outbox where ((status='pending' and available_at<=now()) or (status='processing' and locked_until<now())) and attempts<8 order by available_at for update skip locked limit 10) returning *
$$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('slot_available','available_slots','create_booking_hold','queue_appointment_event','confirm_booking','manage_appointment','take_rate_limit','claim_outbox') loop
   execute format('revoke all on function %s from public, anon, authenticated',f.signature);
   execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
commit;
