begin;
create function public.save_configuration(p_actor uuid,p_resource text,p_id uuid,p_values jsonb,p_remove boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare m business_members; ref uuid; existing_business uuid; cols text; vals text; pairs text; k text;
begin
 select * into m from business_members where user_id=p_actor and is_active and role in ('owner','admin');
 if m.user_id is null then raise exception 'Not authorized'; end if;
 if p_resource not in ('businesses','locations','services','staff_members','staff_services','staff_locations','location_hours','staff_availability','staff_time_off') then raise exception 'Invalid resource'; end if;
 perform pg_advisory_xact_lock(hashtextextended(m.business_id::text,0));
 if p_resource='businesses' and p_id is distinct from m.business_id then raise exception 'Invalid business'; end if;
 for k in select jsonb_object_keys(p_values) loop
   if k in ('id','business_id','user_id','role') then raise exception 'Protected field'; end if;
 end loop;
 if p_values ? 'staff_id' and not exists(select 1 from staff_members where id=(p_values->>'staff_id')::uuid and business_id=m.business_id) then raise exception 'Invalid staff'; end if;
 if p_values ? 'location_id' and not exists(select 1 from locations where id=(p_values->>'location_id')::uuid and business_id=m.business_id) then raise exception 'Invalid location'; end if;
 if p_values ? 'service_id' and not exists(select 1 from services where id=(p_values->>'service_id')::uuid and business_id=m.business_id) then raise exception 'Invalid service'; end if;
 if p_id is not null and p_resource<>'businesses' then
   if p_resource in ('services','locations','staff_members') then
     execute format('select business_id from %I where id=$1',p_resource) into existing_business using p_id;
   elsif p_resource='location_hours' then
     select l.business_id into existing_business from location_hours h join locations l on l.id=h.location_id where h.id=p_id;
   else
     execute format('select s.business_id from %I r join staff_members s on s.id=r.staff_id where r.id=$1',p_resource) into existing_business using p_id;
   end if;
   if existing_business is distinct from m.business_id then raise exception 'Not authorized'; end if;
 end if;
 if p_remove then
   if p_resource in ('businesses','locations','services','staff_members') then raise exception 'Deactivate this record instead'; end if;
   if p_resource in ('staff_services','staff_locations') then
     execute format('delete from %I where staff_id=$1 and %I=$2',p_resource,case p_resource when 'staff_services' then 'service_id' else 'location_id' end) using (p_values->>'staff_id')::uuid,coalesce(p_values->>'service_id',p_values->>'location_id')::uuid;
   else execute format('delete from %I where id=$1',p_resource) using p_id; end if;
 else
   if p_resource in ('locations','services','staff_members') then p_values:=p_values||jsonb_build_object('business_id',m.business_id); end if;
   select string_agg(format('%I',key),','),string_agg(format('r.%I',key),','),string_agg(format('%I=r.%I',key,key),',') into cols,vals,pairs from jsonb_object_keys(p_values) key;
   if p_id is not null then
     execute format('update %I t set %s from jsonb_populate_record(null::%I,$1) r where t.id=$2',p_resource,pairs,p_resource) using p_values,p_id;
   else
     execute format('insert into %I (%s) select %s from jsonb_populate_record(null::%I,$1) r on conflict do nothing',p_resource,cols,vals,p_resource) using p_values;
   end if;
 end if;
 insert into audit_logs(business_id,actor_id,entity_id,action) values(m.business_id,p_actor,p_id,'configuration:'||p_resource);
end $$;
revoke all on function public.save_configuration(uuid,text,uuid,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.save_configuration(uuid,text,uuid,jsonb,boolean) to service_role;
commit;
