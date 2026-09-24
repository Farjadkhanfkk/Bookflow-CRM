-- Run once in the project's Supabase SQL Editor after applying the migrations.
-- Choose the primary account's exact existing Auth email below. No password changes.
begin;
do $$
declare
 owner_email text := 'admin@luminamedspa.com';
 target_user uuid;
 target_business uuid := '00000000-0000-4000-8000-000000000001';
begin
 perform pg_advisory_xact_lock(hashtextextended(target_business::text,0));
 select id into target_user from auth.users where lower(email)=lower(owner_email);
 if target_user is null then raise exception 'The selected email does not exist in Supabase Auth'; end if;
 if exists(select 1 from public.business_members where user_id=target_user and business_id<>target_business) then raise exception 'Account belongs to another business'; end if;
 if exists(select 1 from public.business_members where business_id=target_business and role='owner' and is_active and user_id<>target_user) then raise exception 'An owner already exists. Ask that owner to grant access in the dashboard.'; end if;
 insert into public.business_members(user_id,business_id,role,is_active)
 values(target_user,target_business,'owner',true)
 on conflict(user_id) do update set role='owner',is_active=true;
 insert into public.audit_logs(business_id,actor_id,entity_id,action) values(target_business,target_user,target_user,'initial_owner_setup');
end $$;
commit;
