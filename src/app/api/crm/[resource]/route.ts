import { adminDb } from '@/lib/server/db';
import { body,checkOrigin,handle,HttpError,json,requireMember } from '@/lib/server/http';
import { uuid } from '@/lib/validation';
import { z } from 'zod';

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  return handle(async () => {
    const { resource } = await context.params;
    const member = await requireMember(resource === 'leads' || resource === 'reports' ? ['owner','admin','receptionist'] : undefined);
    if (resource === 'customer-detail') {
      const id = uuid.parse(new URL(request.url).searchParams.get('id'));
      const { data: customer, error } = await member.db.from('customers').select('id,full_name,email,phone,notes,email_consent,sms_consent,whatsapp_consent').eq('id',id).maybeSingle();
      if(error) throw error; if(!customer) throw new HttpError(404,'Customer not found.');
      const { data: appointments, error: ae } = await member.db.from('appointments').select('id').eq('customer_id',id); if(ae) throw ae;
      const ids=(appointments??[]).map(a=>a.id);
      const [payments,jobs,tasks]=await Promise.all([
        member.db.from('payments').select('id,amount,refunded_amount,currency,status').in('appointment_id',ids),
        adminDb().from('outbox').select('id,event_type,channel,status').in('appointment_id',ids).order('created_at',{ascending:false}).limit(100),
        member.db.from('tasks').select('id,title,status').eq('customer_id',id),
      ]);
      for(const r of [payments,jobs,tasks]) if(r.error) throw r.error;
      return json({customer,payments:payments.data,jobs:jobs.data,tasks:tasks.data});
    }
    if (resource === 'notifications') {
      if (!['owner','admin'].includes(member.role)) throw new HttpError(403,'Not allowed.');
      const { data: a, error: ae } = await member.db.from('appointments').select('id'); if (ae) throw ae;
      const { data, error } = await adminDb().from('outbox').select('id,appointment_id,event_type,channel,status,attempts,last_error,created_at').in('appointment_id',(a??[]).map(r=>r.id)).order('created_at',{ascending:false}).limit(200);
      if (error) throw error; return json({ jobs:data });
    }
    if (resource === 'leads') {
      const results = await Promise.all([
        member.db.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
        member.db.from('lead_activities').select('*').order('created_at', { ascending: false }).limit(1000),
        adminDb().from('business_members').select('user_id,role').eq('business_id', member.businessId).eq('is_active', true),
      ]);
      results.forEach(r => { if (r.error) throw r.error; });
      return json({ leads: results[0].data, activities: results[1].data, members: results[2].data });
    }
    if (resource === 'tasks') {
      const { data, error } = await member.db.from('tasks').select('*').order('due_at').limit(500);
      if (error) throw error; return json({ tasks: data });
    }
    if (resource === 'reports') {
      const { data, error } = await adminDb().rpc('operational_report',{p_actor:member.user.id,p_since:new Date(Date.now()-30*86400000).toISOString(),p_until:new Date().toISOString()});
      if(error) throw error; return json(data);
    }
    throw new HttpError(404,'Not found.');
  });
}
export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  return handle(async () => {
    checkOrigin(request);
    const { resource } = await context.params;
    const m = await requireMember(); const db = adminDb();
    if (resource === 'appointments') {
      const input = await body(request, z.object({ id: uuid, status: z.enum(['confirmed','checked_in','in_progress','completed','cancelled','no_show']).optional(), notes: z.string().max(5000).optional() }).strict());
      const { error } = await db.rpc('update_appointment', { p_actor: m.user.id, p_id: input.id, p_status: input.status ?? null, p_notes: input.notes ?? null });
      if (error) throw new HttpError(409,'This change is not allowed for the appointment.');
      return json({ updated: true });
    }
    if (resource === 'my-time-off') {
      if(!m.staffId) throw new HttpError(400,'Link your account to a provider first.');
      const input=await body(request,z.object({starts_at:z.string().datetime({offset:true}),ends_at:z.string().datetime({offset:true}),reason:z.string().max(500)}).strict().refine(v=>Date.parse(v.ends_at)>Date.parse(v.starts_at)));
      const {error}=await db.rpc('save_my_time_off',{p_actor:m.user.id,p_start:input.starts_at,p_end:input.ends_at,p_reason:input.reason});
      if(error) throw new HttpError(409,'Time off could not be saved.');return json({saved:true});
    }
    if (resource === 'tasks') {
      const input = await body(request, z.object({ id: uuid.optional(), title: z.string().trim().min(2).max(200).optional(), due_at: z.string().datetime({ offset: true }).nullable().optional(), lead_id: uuid.nullable().optional(), customer_id: uuid.nullable().optional(), status: z.enum(['open','completed']).default('open') }).strict());
      if (input.id) {
        let query = db.from('tasks').update({ status: input.status }).eq('id', input.id).eq('business_id', m.businessId);
        if (m.role === 'staff') query = query.eq('assigned_to', m.user.id);
        const { data, error } = await query.select('id').maybeSingle();
        if (error || !data) throw new HttpError(403,'This task is not available.');
      } else {
        if (m.role === 'staff' || !input.title) throw new HttpError(403,'Task creation is not allowed.');
        for (const [table, id] of [['leads',input.lead_id],['customers',input.customer_id]] as const) {
          if (id) { const { data } = await db.from(table).select('id').eq('id',id).eq('business_id',m.businessId).maybeSingle(); if (!data) throw new HttpError(400,'Invalid task link.'); }
        }
        const { error } = await db.from('tasks').insert({ business_id: m.businessId, title: input.title, due_at: input.due_at, lead_id: input.lead_id, customer_id: input.customer_id, assigned_to: m.user.id });
        if (error) throw error;
      }
      return json({ updated: true });
    }
    if (resource === 'members') {
      if(m.role!=='owner') throw new HttpError(403,'Owner access is required.');
      const input=await body(request,z.object({user_id:uuid,role:z.enum(['owner','admin','receptionist','staff']),staff_id:uuid.nullable(),is_active:z.boolean()}).strict());
      const {error}=await db.rpc('set_membership',{p_actor:m.user.id,p_user:input.user_id,p_role:input.role,p_staff:input.staff_id,p_active:input.is_active});
      if(error) throw new HttpError(409,'Membership could not be updated. Check the user and provider IDs; the last owner must remain active.');
      return json({updated:true});
    }
    if (m.role === 'staff') throw new HttpError(403,'This operation is not allowed.');
    if (resource === 'leads') {
      const input = await body(request, z.object({ id: uuid, status: z.enum(['new','contacted','qualified','appointment_booked','converted','lost']), assigned_to: uuid.nullable().default(null), note: z.string().max(2000).optional(), appointment_id: uuid.nullable().optional() }).strict());
      const { error } = await db.rpc('update_lead', { p_actor:m.user.id, p_id:input.id, p_status:input.status, p_assignee:input.assigned_to, p_note:input.note ?? null, p_appointment:input.appointment_id ?? null });
      if (error) throw new HttpError(400,'Lead update could not be applied.');
      return json({ updated: true });
    }
    if (resource === 'customers') {
      const input = await body(request, z.object({ id: uuid.optional(), full_name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254).optional(), phone: z.string().max(25).optional(), notes: z.string().max(5000).optional() }).strict());
      const { id, ...values } = input;
      const query = id ? db.from('customers').update(values).eq('id', id).eq('business_id', m.businessId) : db.from('customers').insert({ ...values, business_id:m.businessId, email: input.email?.toLowerCase() });
      const { data, error } = await query.select('id').single(); if (error) throw error; return json(data);
    }
    throw new HttpError(404,'Not found.');
  });
}
