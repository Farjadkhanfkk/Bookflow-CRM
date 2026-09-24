import { afterAll, beforeAll, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs/promises';
const db=new PGlite({extensions:{btree_gist}});
const biz='00000000-0000-4000-8000-000000000001';
const owner='40000000-0000-4000-8000-000000000001',admin='40000000-0000-4000-8000-000000000002',worker='40000000-0000-4000-8000-000000000003',other='40000000-0000-4000-8000-000000000004';
const staff='20000000-0000-4000-8000-000000000001',second='20000000-0000-4000-8000-000000000002',service='10000000-0000-4000-8000-000000000001',location='30000000-0000-4000-8000-000000000001';
const start=new Date(Date.now()+8*86400000);start.setUTCHours(18,0,0,0);const day=start.toISOString().slice(0,10);
let appointment:string;
beforeAll(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to authenticated;`);
 for(const file of (await fs.readdir('supabase/migrations')).sort())await db.exec(await fs.readFile(`supabase/migrations/${file}`,'utf8'));
 await db.exec(`insert into auth.users values('${owner}','owner@example.test'),('${admin}','admin@example.test'),('${worker}','staff@example.test'),('${other}','other@example.test');insert into staff_members(id,name,is_bookable) values('${staff}','Staff One',true),('${second}','Staff Two',true);insert into business_members(user_id,business_id,role,staff_id) values('${owner}','${biz}','owner',null),('${admin}','${biz}','admin',null),('${worker}','${biz}','staff','${staff}'),('${other}','${biz}','staff','${second}');insert into services(id,name,is_active) values('${service}','Treatment',true);insert into locations(id,business_id,name,timezone,is_active) values('${location}','${biz}','Location','America/Los_Angeles',true);insert into staff_services values('${staff}','${service}');insert into staff_locations values('${staff}','${location}');insert into location_hours(location_id,weekday,opens,closes) select '${location}',generate_series(0,6),'08:00','19:00';insert into staff_availability(staff_id,location_id,weekday,opens,closes) select '${staff}','${location}',generate_series(0,6),'08:00','19:00';`);
});
afterAll(()=>db.close());
it('allows admins to manage staff but prevents staff elevation and last-owner removal',async()=>{
 await db.query("select set_membership($1,$2,'staff',$3,true)",[admin,worker,staff]);
 await expect(db.query("select set_membership($1,$1,'owner',$2,true)",[worker,staff])).rejects.toThrow('Administrator');
 await expect(db.query("select set_membership($1,$2,'owner',null,true)",[admin,worker])).rejects.toThrow('Only owners');
 await expect(db.query("select set_membership($1,$1,'admin',null,true)",[owner])).rejects.toThrow('last owner');
 await expect(db.query("select set_membership($1,$2,'staff',$3,true)",[admin,other,staff])).rejects.toThrow('already linked');
});
it('links an existing account by email and keeps new providers closed for setup',async()=>{
 const id='40000000-0000-4000-8000-000000000005';await db.query('insert into auth.users values($1,$2)',[id,'new@example.test']);
 await db.query("select link_team_member($1,'NEW@example.test','staff',null,'New Staff')",[admin]);
 const result=await db.query<{is_bookable:boolean}>("select s.is_bookable from staff_members s join business_members m on m.staff_id=s.id where m.user_id=$1",[id]);
 expect(result.rows[0].is_bookable).toBe(false);
});
it('sends notifications only to assigned staff and administrators with one email per event',async()=>{
 const result=await db.query<{id:string}>('insert into appointments(staff_id,service_id,location_id,appointment_time,blocked_start,blocked_end) values($1,$2,$3,$4,$4,$4::timestamptz+interval \'1 hour\') returning id',[staff,service,location,start.toISOString()]);appointment=result.rows[0].id;
 const recipients=await db.query<{user_id:string}>('select user_id from staff_notifications where appointment_id=$1',[appointment]);
 expect(recipients.rows.map(r=>r.user_id).sort()).toEqual([owner,admin,worker].sort());
 expect((await db.query('select * from outbox where channel=\'staff_email\'')).rows).toHaveLength(3);
 await db.query('update appointments set notes=$2 where id=$1',[appointment,'Internal note']);
 expect((await db.query('select * from staff_notifications where appointment_id=$1',[appointment])).rows).toHaveLength(3);
});
it('enforces assigned-only appointment and notification visibility through RLS',async()=>{
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`);
 expect((await db.query('select * from appointments')).rows).toHaveLength(0);
 expect((await db.query('select * from staff_notifications')).rows).toHaveLength(0);
 await db.exec(`select set_config('request.jwt.claim.sub','${worker}',false);`);
 expect((await db.query('select * from appointments')).rows).toHaveLength(1);
 expect((await db.query('select * from staff_notifications')).rows).toHaveLength(1);
 await db.exec(`select set_config('request.jwt.claim.sub','${admin}',false);`);
 expect((await db.query('select * from appointments')).rows).toHaveLength(1);
 await db.exec('reset role');
});
it('blocks the whole local day, warns admins about existing bookings, and allows only own removal',async()=>{
 const result=await db.query<{result:{id:string;conflicts:number}}>('select set_my_unavailable($1,$2,$2,$3) result',[worker,day,'Away']);
 expect(result.rows[0].result.conflicts).toBe(1);
 const next=new Date(+start+2*3600000).toISOString();
 expect((await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) ok',[service,location,staff,next])).rows[0].ok).toBe(false);
 expect((await db.query<{status:string}>('select status from appointments where id=$1',[appointment])).rows[0].status).toBe('confirmed');
 await expect(db.query('select remove_my_unavailable($1,$2)',[other,result.rows[0].result.id])).rejects.toThrow('not found');
 await db.query('select remove_my_unavailable($1,$2)',[worker,result.rows[0].result.id]);
 expect((await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) ok',[service,location,staff,next])).rows[0].ok).toBe(true);
});
it('removes staff access and booking eligibility while preserving appointments',async()=>{
 await db.query("select set_membership($1,$2,'staff',$3,false)",[admin,worker,staff]);
 expect((await db.query<{is_bookable:boolean}>('select is_bookable from staff_members where id=$1',[staff])).rows[0].is_bookable).toBe(false);
 await db.exec(`set role authenticated;select set_config('request.jwt.claim.sub','${worker}',false);`);
 expect((await db.query('select * from appointments')).rows).toHaveLength(0);
 expect((await db.query('select * from staff_notifications')).rows).toHaveLength(0);
 await db.exec('reset role');expect((await db.query('select * from appointments')).rows).toHaveLength(1);
});
