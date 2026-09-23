import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import fs from 'node:fs/promises';

const db = new PGlite({ extensions: { btree_gist } });
const biz='00000000-0000-4000-8000-000000000001';
const service='10000000-0000-4000-8000-000000000001';
const staff='20000000-0000-4000-8000-000000000001';
const other='20000000-0000-4000-8000-000000000002';
const location='30000000-0000-4000-8000-000000000001';
const owner='40000000-0000-4000-8000-000000000001';
const worker='40000000-0000-4000-8000-000000000002';
const start=new Date(Date.now()+7*86400000); start.setUTCHours(18,0,0,0);
const at=(minutes=0) => new Date(+start+minutes*60000).toISOString();
type Hold = { id:string; token_hash:string; staff_id:string; appointment_id:string };
async function hold(time=at(), provider:string|null=staff, token='hold-test') {
  return (await db.query<Hold>('select * from create_booking_hold($1,$2,$3,$4,$5)',[service,location,provider,time,token])).rows[0];
}
async function bind(id:string) {
  await db.query('update booking_holds set customer=$2::jsonb where id=$1',[id,JSON.stringify({name:'Test Customer',email:'test@example.test',phone:'+15555550100',emailConsent:true,smsConsent:false})]);
}
beforeAll(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to public;`);
  for (const file of (await fs.readdir('supabase/migrations')).sort()) await db.exec(await fs.readFile(`supabase/migrations/${file}`,'utf8'));
  await db.exec(`insert into services(id,name,price,business_id,is_active,duration_minutes,preparation_minutes,cleanup_minutes,price_amount,deposit_amount) values('${service}','Test treatment','100','${biz}',true,60,15,15,10000,0);
    insert into staff_members(id,name,business_id,is_bookable) values('${staff}','Provider A','${biz}',true),('${other}','Provider B','${biz}',true);
    insert into locations(id,business_id,name,timezone,is_active) values('${location}','${biz}','Test location','America/Los_Angeles',true);
    insert into staff_services select id,'${service}' from staff_members;
    insert into staff_locations select id,'${location}' from staff_members;
    insert into location_hours(location_id,weekday,opens,closes) select '${location}',generate_series(0,6),'08:00','19:00';
    insert into staff_availability(staff_id,location_id,weekday,opens,closes) select id,'${location}',generate_series(0,6),'08:00','19:00' from staff_members;
    insert into auth.users values('${owner}'),('${worker}');
    insert into business_members(user_id,business_id,role,staff_id) values('${owner}','${biz}','owner',null),('${worker}','${biz}','staff','${other}');`);
});
afterAll(async () => { await db.close(); });
describe('booking database and authorization', () => {
  it('applies migrations and excludes preparation/cleanup outside business hours', async () => {
    const early=new Date(start);early.setUTCHours(15,0,0,0);
    const result=await db.query<{ok:boolean}>('select slot_available($1,$2,$3,$4) as ok',[service,location,staff,early.toISOString()]);
    expect(result.rows[0].ok).toBe(false);
  });
  it('serializes simultaneous reservations and selects any other available provider', async () => {
    const attempts=await Promise.allSettled([hold(),hold()]);
    expect(attempts.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    const h=await hold(at(),null);expect(h.staff_id).toBe(other);
    await expect(hold(at(),null)).rejects.toThrow();
  });
  it('expired holds no longer block slots', async () => {
    await db.exec("update booking_holds set expires_at=now()-interval '1 second'");
    expect((await hold()).id).toBeTruthy();
  });
  it('does not release an existing appointment until a valid replacement is committed', async () => {
    const h=(await db.query<Hold>("select * from booking_holds where expires_at>now() and staff_id=$1",[staff])).rows[0];
    await bind(h.id);
    const confirmed=await db.query<{id:string}>('select confirm_booking($1,$2,$3) as id',[h.id,'hold-test','manage-test']);
    const id=confirmed.rows[0].id;
    const again=await db.query<{id:string}>('select confirm_booking($1,$2,$3) as id',[h.id,'hold-test','manage-test']);
    expect(again.rows[0].id).toBe(id);
    await expect(hold(at(60))).rejects.toThrow(); // cleanup/preparation buffers overlap
    await expect(db.query("select manage_appointment('manage-test','reschedule',null,null)")).rejects.toThrow();
    expect((await db.query<{status:string}>('select status from appointments where id=$1',[id])).rows[0].status).toBe('confirmed');
    const replacement=(await db.query<Hold>('select * from create_booking_hold($1,$2,$3,$4,$5,$6,$7)',[service,location,staff,at(120),'replacement',id,'manage-test'])).rows[0];
    await db.query("select manage_appointment('manage-test','reschedule',$1,'replacement')",[replacement.id]);
    const moved=(await db.query<{appointment_time:Date}>('select appointment_time from appointments where id=$1',[id])).rows[0];
    expect(new Date(moved.appointment_time).toISOString()).toBe(at(120));
  });
  it('denies unrelated staff changes and preserves payment state on completion', async () => {
    const a=(await db.query<{id:string}>('select id from appointments limit 1')).rows[0];
    await expect(db.query("select update_appointment($1,$2,'completed')",[worker,a.id])).rejects.toThrow();
    await expect(db.query("select update_appointment($1,$2,'completed')",[owner,a.id])).rejects.toThrow();
    await db.query("select update_appointment($1,$2,'checked_in')",[owner,a.id]);
    await db.query("select update_appointment($1,$2,'completed')",[owner,a.id]);
    expect((await db.query<{payment_status:string}>('select payment_status from appointments where id=$1',[a.id])).rows[0].payment_status).toBe('not_required');
  });
  it('blocks time off and external busy periods', async () => {
    await db.query('insert into staff_time_off(staff_id,starts_at,ends_at) values($1,$2,$3)',[staff,at(240),at(300)]);
    await expect(hold(at(240))).rejects.toThrow();
    await db.query('insert into external_busy_blocks(staff_id,starts_at,ends_at) values($1,$2,$3)',[staff,at(300),at(360)]);
    await expect(hold(at(300))).rejects.toThrow();
  });
  it('requires matching payment and fulfills duplicate webhooks only once', async () => {
    await db.query('update services set deposit_amount=2500 where id=$1',[service]);
    const h=await hold(at(),staff,'paid-hold'); await bind(h.id);
    await db.query("update booking_holds set checkout_session_id='cs_test_1' where id=$1",[h.id]);
    await expect(db.query('select confirm_booking($1,$2,$3)',[h.id,'paid-hold','paid-manage'])).rejects.toThrow();
    await expect(db.query("select confirm_booking($1,$2,$3,'cs_test_1','pi_test',1,'usd','evt_1')",[h.id,'paid-hold','paid-manage'])).rejects.toThrow();
    const args=[h.id,'paid-hold','paid-manage'];
    const results=await Promise.all([db.query("select confirm_booking($1,$2,$3,'cs_test_1','pi_test',2500,'usd','evt_1') as id",args),db.query("select confirm_booking($1,$2,$3,'cs_test_1','pi_test',2500,'usd','evt_1') as id",args)]);
    expect(results[0].rows[0]).toEqual(results[1].rows[0]);
    expect((await db.query<{n:number}>('select count(*)::int as n from payments')).rows[0].n).toBe(1);
    expect((await db.query<{n:number}>('select count(*)::int as n from customers')).rows[0].n).toBe(1);
  });
  it('enforces cancellation cutoff, token verification, and monotonic refunds', async () => {
    await expect(db.query("select manage_appointment('wrong-token','cancel')")).rejects.toThrow();
    await db.exec("update businesses set cancellation_hours=720");
    await expect(db.query("select manage_appointment('paid-manage','cancel')")).rejects.toThrow();
    await db.exec("update businesses set cancellation_hours=24");
    await db.query("select manage_appointment('paid-manage','cancel')");
    await db.query("select record_refund('pi_test',2500,'evt_refund')");
    await db.query("select record_refund('pi_test',500,'evt_old')");
    expect((await db.query<{status:string}>('select status from payments')).rows[0].status).toBe('refunded');
  });
  it('denies public private-data access and RPC calls, scopes staff rows', async () => {
    await db.exec('set role anon');
    await expect(db.query('select * from customers')).rejects.toThrow();
    await expect(db.query('select * from booking_holds')).rejects.toThrow();
    await expect(db.query("select manage_appointment('paid-manage','cancel')")).rejects.toThrow();
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[worker]);await db.exec('set role authenticated');
    expect((await db.query('select * from appointments')).rows).toHaveLength(0);
    await expect(db.query("update appointments set notes='forged'")).rejects.toThrow();
    await db.exec('reset role');
  });
  it('creates leads and follow-up tasks transactionally and validates assignments', async () => {
    await db.query('select create_lead($1,$2,$3,$4,$5)',[biz,'Test Lead','lead@example.test','+15555550101','A consultation request']);
    const l=(await db.query<{id:string}>('select id from leads')).rows[0];
    await expect(db.query("select update_lead($1,$2,'converted',$3)",[owner,l.id,'99999999-0000-4000-8000-000000000001'])).rejects.toThrow();
    await db.query("select update_lead($1,$2,'converted',$1)",[owner,l.id]);
    expect((await db.query<{customer_id:string}>('select customer_id from leads')).rows[0].customer_id).toBeTruthy();
    expect((await db.query('select * from tasks')).rows).toHaveLength(1);
  });
});
