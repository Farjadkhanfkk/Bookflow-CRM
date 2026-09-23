begin;
create function public.queue_whatsapp_copy() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.channel='sms' then
  insert into outbox(appointment_id,event_type,channel,idempotency_key,available_at)
  values(new.appointment_id,new.event_type,'whatsapp',regexp_replace(new.idempotency_key,':sms$',':whatsapp'),new.available_at)
  on conflict(idempotency_key) do nothing;
 end if;
 return new;
end $$;
create trigger outbox_whatsapp after insert on public.outbox for each row execute function public.queue_whatsapp_copy();
revoke all on function public.queue_whatsapp_copy() from public,anon,authenticated;
grant execute on function public.queue_whatsapp_copy() to service_role;
commit;
