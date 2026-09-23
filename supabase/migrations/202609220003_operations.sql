begin;
create function public.update_appointment(p_actor uuid,p_id uuid,p_status text default null,p_notes text default null)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members; a appointments; allowed boolean;
begin
 select * into m from business_members where user_id=p_actor and is_active;
 if m.user_id is null then raise exception 'Not authorized'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 select * into a from appointments where id=p_id and business_id=m.business_id for update;
 if a.id is null or (m.role='staff' and a.staff_id is distinct from m.staff_id) then raise exception 'Not authorized'; end if;
 if p_status is not null and p_status<>lower(a.status) then
   allowed:=case lower(a.status)
     when 'confirmed' then p_status in ('checked_in','cancelled','no_show')
     when 'checked_in' then p_status in ('in_progress','completed','cancelled')
     when 'in_progress' then p_status='completed'
     when 'pending_payment' then p_status='cancelled' else false end;
   if not allowed or (m.role='staff' and p_status='cancelled') then raise exception 'Invalid transition'; end if;
   if p_status='no_show' and a.appointment_time>now() then raise exception 'Appointment has not started'; end if;
   update appointments set status=p_status where id=p_id;
   insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_id,a.status||' -> '||p_status);
   perform queue_appointment_event(p_id,'booking_'||p_status,p_id::text||':'||p_status);
   if p_status='cancelled' then
     insert into outbox(appointment_id,event_type,channel,idempotency_key) values(p_id,'refund','stripe',p_id::text||':refund') on conflict do nothing;
   end if;
   if p_status='completed' then
     update leads set status='converted' where appointment_id=p_id;
   end if;
 end if;
 if p_notes is not null then
   if length(p_notes)>5000 then raise exception 'Notes too long'; end if;
   update appointments set notes=p_notes where id=p_id;
   insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_id,'notes_updated');
 end if;
end $$;
create function public.record_refund(p_intent text,p_amount integer,p_event text)
returns void language plpgsql security definer set search_path=public as $$
declare p payments;
begin
 select * into p from payments where payment_intent_id=p_intent for update;
 if p.id is null then return; end if;
 if p_amount<0 or p_amount>p.amount then raise exception 'Invalid refund amount'; end if;
 update payments set refunded_amount=greatest(refunded_amount,p_amount),status=case when greatest(refunded_amount,p_amount)=amount then 'refunded' else 'partially_refunded' end where id=p.id;
 update appointments set payment_status=case when greatest(p.refunded_amount,p_amount)=p.amount then 'refunded' else 'partially_refunded' end where id=p.appointment_id;
 insert into stripe_webhook_events(id,event_type) values(p_event,'charge.refunded') on conflict do nothing;
end $$;
create function public.create_lead(p_business uuid,p_name text,p_email text,p_phone text,p_message text)
returns void language plpgsql security definer set search_path=public as $$
declare lid uuid; assignee uuid;
begin
 select user_id into assignee from business_members where business_id=p_business and is_active and role in ('receptionist','admin','owner') order by case role when 'receptionist' then 0 else 1 end,user_id limit 1;
 insert into leads(business_id,full_name,email,phone,message,assigned_to) values(p_business,p_name,lower(p_email),p_phone,p_message,assignee) returning id into lid;
 insert into tasks(business_id,lead_id,assigned_to,title,due_at) values(p_business,lid,assignee,'Follow up on consultation request',now()+interval '1 day');
 insert into lead_activities(lead_id,description) values(lid,'Consultation request received');
end $$;
create function public.update_lead(p_actor uuid,p_id uuid,p_status text,p_assignee uuid default null,p_note text default null,p_appointment uuid default null)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members; l leads; cid uuid;
begin
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin','receptionist');
 if m.user_id is null then raise exception 'Not authorized'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 select * into l from leads where id=p_id and business_id=m.business_id for update;
 if l.id is null then raise exception 'Not authorized'; end if;
 if p_assignee is not null and not exists(select 1 from business_members where user_id=p_assignee and business_id=m.business_id and is_active) then raise exception 'Invalid assignee'; end if;
 if p_appointment is not null and not exists(select 1 from appointments where id=p_appointment and business_id=m.business_id) then raise exception 'Invalid appointment'; end if;
 if p_status='converted' and l.customer_id is null then
   select id into cid from customers where business_id=m.business_id and lower(email)=lower(l.email) order by id limit 1;
   if cid is null then insert into customers(business_id,full_name,email,phone) values(m.business_id,l.full_name,l.email,l.phone) returning id into cid; end if;
   update leads set customer_id=cid where id=l.id;
 end if;
 update leads set status=p_status,assigned_to=p_assignee,appointment_id=coalesce(p_appointment,appointment_id) where id=l.id;
 insert into lead_activities(lead_id,actor_id,description) values(l.id,p_actor,'Stage: '||p_status);
 if p_note is not null and length(trim(p_note))>0 then insert into lead_activities(lead_id,actor_id,description) values(l.id,p_actor,p_note); end if;
end $$;
-- Link leads without changing any customer data. This executes in the booking transaction.
create function public.link_appointment_lead() returns trigger language plpgsql security definer set search_path=public as $$
begin
 update leads set appointment_id=new.id,customer_id=new.customer_id,status='appointment_booked'
 where business_id=new.business_id and lower(email)=(select lower(email) from customers where id=new.customer_id) and status not in ('converted','lost');
 return new;
end $$;
create trigger appointment_lead after insert on public.appointments for each row execute function public.link_appointment_lead();
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('update_appointment','record_refund','create_lead','update_lead','link_appointment_lead') loop
   execute format('revoke all on function %s from public, anon, authenticated',f.signature);
   execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
commit;
