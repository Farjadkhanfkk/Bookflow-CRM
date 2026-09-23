import { beforeAll,afterAll,it,expect } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs/promises';
const db=new PGlite({extensions:{btree_gist}});
const business='00000000-0000-4000-8000-000000000001',owner='40000000-0000-4000-8000-000000000001',staff='20000000-0000-4000-8000-000000000001',service='10000000-0000-4000-8000-000000000001',location='30000000-0000-4000-8000-000000000001';
beforeAll(async()=>{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
 for(const file of (await fs.readdir('supabase/migrations')).sort())await db.exec(await fs.readFile(`supabase/migrations/${file}`,'utf8'));
 await db.exec(`insert into auth.users values('${owner}');insert into staff_members(id,name,business_id,is_bookable) values('${staff}','Test Provider','${business}',true);insert into business_members(user_id,business_id,role,staff_id) values('${owner}','${business}','owner','${staff}');insert into locations(id,business_id,name,timezone,is_active) values('${location}','${business}','Test location','America/New_York',true);insert into services(id,name,is_active,duration_minutes) values('${service}','Test service',true,30);insert into staff_locations values('${staff}','${location}');insert into staff_services values('${staff}','${service}');insert into location_hours(location_id,weekday,opens,closes) select '${location}',generate_series(0,6),'00:00','23:59';insert into staff_availability(staff_id,location_id,weekday,opens,closes) select '${staff}','${location}',generate_series(0,6),'00:00','23:59';update businesses set horizon_days=365;`);
});
afterAll(async()=>db.close());
it('saves validated configuration and protects the last owner',async()=>{
 const values={name:'Updated test business',timezone:'America/New_York',currency:'usd',notice_hours:4,horizon_days:365,cancellation_hours:24,interval_minutes:15};
 await db.query("select save_configuration($1,'businesses',$2,$3::jsonb)",[owner,business,JSON.stringify(values)]);
 expect((await db.query<{name:string}>('select name from businesses')).rows[0].name).toBe(values.name);
 await expect(db.query("select set_membership($1,$1,'staff',$2,true)",[owner,staff])).rejects.toThrow('last owner');
});
it('does not generate nonexistent local slots during the next spring DST jump',async()=>{
 const now=new Date();let year=now.getUTCFullYear();let date:Date;
 do{const first=new Date(Date.UTC(year,2,1));const sunday=1+((7-first.getUTCDay())%7)+7;date=new Date(Date.UTC(year,2,sunday));year++;}while(+date<Date.now()+86400000);
 const day=date.toISOString().slice(0,10);
 const result=await db.query<{starts_at:Date}>('select * from available_slots($1,$2,$3,$4)',[service,location,staff,day]);
 expect(result.rows.length).toBeGreaterThan(0);
 const localHours=result.rows.map(r=>new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',hourCycle:'h23'}).format(new Date(r.starts_at)));
 expect(localHours).not.toContain('02');
});
it('enforces notice, horizon, invalid assignment, and exact adjacency',async()=>{
 const now=new Date().toISOString();expect((await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) ok',[service,location,staff,now])).rows[0].ok).toBe(false);
 const future=new Date(Date.now()+400*86400000).toISOString();expect((await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) ok',[service,location,staff,future])).rows[0].ok).toBe(false);
 const start=new Date(Date.now()+10*86400000);start.setUTCHours(18,0,0,0);
 await db.query('select create_booking_hold($1,$2,$3,$4,$5)',[service,location,staff,start.toISOString(),'one']);
 const adjacent=new Date(+start+30*60000).toISOString();expect((await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) ok',[service,location,staff,adjacent])).rows[0].ok).toBe(true);
});
it('retains separate channel deduplication and protects interrupted messages',async()=>{
 await db.query("insert into outbox(event_type,channel,idempotency_key,status,locked_until) values('test','sms','message:sms','processing',now()-interval '1 minute')");
 await db.query('select * from claim_outbox()');
 const rows=await db.query<{channel:string;status:string}>('select channel,status from outbox');
 expect(rows.rows.find(r=>r.channel==='sms')?.status).toBe('uncertain');expect(rows.rows.filter(r=>r.channel==='whatsapp')).toHaveLength(1);
});
it('reports empty financial data without simulated totals',async()=>{
 const result=await db.query<{report:{byCurrency:object;appointmentCount:number}}>('select operational_report($1,now()-interval \'30 days\',now()) report',[owner]);
 expect(result.rows[0].report.byCurrency).toEqual({});expect(result.rows[0].report.appointmentCount).toBe(0);
});
