import 'server-only';
import { stripeClient } from './booking';
import { config } from './config';
import { adminDb } from './db';
import { DeliveryUncertain,email,googleAccess,notifyN8n,providerFetch,sms,whatsapp } from './providers';
import { manageToken } from './security';

type Appointment={id:string;staff_id:string;customer_id:string;appointment_time:string;duration_minutes:number;status:string;service_name_snapshot:string;business_id:string};
type Job={id:string;appointment_id:string|null;hold_id:string|null;event_type:string;channel:string;idempotency_key:string;attempts:number;created_at:string};
async function syncCalendar(a:Appointment){
 const db=adminDb();const {data:old,error}=await db.from('appointment_calendar_events').select('*').eq('appointment_id',a.id).maybeSingle();if(error)throw error;
 if(old&&(old.staff_id!==a.staff_id||a.status==='cancelled')){
  const previous=await googleAccess(old.staff_id);
  if(previous){const response=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(old.calendar_id)}/events/${old.event_id}`,{method:'DELETE',headers:{Authorization:`Bearer ${previous.accessToken}`},signal:AbortSignal.timeout(12000)});if(!response.ok&&response.status!==404&&response.status!==410)throw new Error('Calendar deletion failed');}
  else throw new Error('Reconnect the previous provider to remove its calendar event');
  const {error:removeError}=await db.from('appointment_calendar_events').delete().eq('appointment_id',a.id);if(removeError)throw removeError;
 }
 if(a.status==='cancelled')return;
 const connection=await googleAccess(a.staff_id);if(!connection)return;
 const eventId=`bf${a.id.replaceAll('-','')}`;const url=`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendarId)}/events`;
 const event={id:eventId,summary:'Lumina appointment',description:`BookFlow reference ${a.id}`,start:{dateTime:a.appointment_time},end:{dateTime:new Date(Date.parse(a.appointment_time)+a.duration_minutes*60000).toISOString()},extendedProperties:{private:{bookflow:'true'}},visibility:'private'};
 const headers={Authorization:`Bearer ${connection.accessToken}`,'Content-Type':'application/json'};
 const response=await fetch(url,{method:'POST',headers,body:JSON.stringify(event),signal:AbortSignal.timeout(12000)});
 if(response.status===409)await providerFetch(`${url}/${eventId}`,{method:'PUT',headers,body:JSON.stringify(event)});else if(!response.ok)throw new Error('Calendar synchronization failed');
 const {error:saveError}=await db.from('appointment_calendar_events').upsert({appointment_id:a.id,staff_id:a.staff_id,event_id:eventId,calendar_id:connection.calendarId});if(saveError)throw saveError;
}
export async function deliverJob(job:Job):Promise<{status:'sent'|'skipped';providerId?:string}>{
 const db=adminDb();
 if(job.channel==='stripe'){
  let query=db.from('payments').select('payment_intent_id,amount,refunded_amount');
  query=job.appointment_id?query.eq('appointment_id',job.appointment_id):query.eq('hold_id',job.hold_id);
  const {data:payment,error}=await query.maybeSingle();if(error)throw error;if(!payment||payment.refunded_amount>=payment.amount)return {status:'skipped'};
  const refund=await stripeClient().refunds.create({payment_intent:payment.payment_intent_id},{idempotencyKey:job.idempotency_key});
  return {status:'sent',providerId:refund.id};
 }
 if(!job.appointment_id)throw new Error('Missing appointment');
 const {data:a,error}=await db.from('appointments').select('id,staff_id,customer_id,appointment_time,duration_minutes,status,service_name_snapshot,business_id').eq('id',job.appointment_id).single();if(error)throw error;
 if(job.event_type==='reminder'&&(a.status!=='confirmed'||Date.parse(a.appointment_time)<=Date.now()))return {status:'skipped'};
 if(job.channel==='google'){await syncCalendar(a);return {status:'sent'};}
 if(job.channel==='n8n'){await notifyN8n(job.id,job.event_type,a.id);return {status:'sent'};}
 const {data:customer,error:customerError}=await db.from('customers').select('email,phone,email_consent,sms_consent,whatsapp_consent').eq('id',a.customer_id).single();if(customerError)throw customerError;
 if(job.channel==='email'&&!customer.email_consent||job.channel==='sms'&&!customer.sms_consent||job.channel==='whatsapp'&&!customer.whatsapp_consent)return {status:'skipped'};
 const {data:hold,error:holdError}=await db.from('booking_holds').select('id').eq('appointment_id',a.id).maybeSingle();if(holdError)throw holdError;
 const url=hold?`${config().APP_URL}/manage-booking/${manageToken(hold.id)}`:config().APP_URL;
 const prefix=job.event_type==='review_request'?'Thank you for your visit. We welcome your feedback through the contact form. ':job.event_type==='no_show_followup'?'We missed you. You can arrange another appointment from our booking page. ':'';
 const message=`${prefix}Lumina appointment update: ${a.status.replaceAll('_',' ')}. Appointment time: ${a.appointment_time} (UTC). View details and manage your booking: ${url}`;
 if(job.channel==='email'){
  if(Date.now()-Date.parse(job.created_at)>23*3600000&&job.attempts>1)throw new DeliveryUncertain('Email idempotency window requires review');
  return {status:'sent',providerId:await email(customer.email,message,job.idempotency_key)};
 }
 if(job.channel==='whatsapp')return {status:'sent',providerId:await whatsapp(customer.phone,url)};
 if(job.channel==='sms')return {status:'sent',providerId:await sms(customer.phone,message)};
 throw new Error('Unknown channel');
}
export async function processOutbox(){
 const db=adminDb();const {data,error}=await db.rpc('claim_outbox');if(error)throw error;
 let sent=0;let failed=0;
 for(const job of (data??[]) as Job[]){
  try{const result=await deliverJob(job);const {error:saveError}=await db.from('outbox').update({status:result.status,provider_id:result.providerId??null,locked_until:null,last_error:null}).eq('id',job.id);if(saveError)throw saveError;sent++;}
  catch(e){failed++;const {error:saveError}=await db.from('outbox').update({status:e instanceof DeliveryUncertain?'uncertain':job.attempts>=8?'failed':'pending',available_at:new Date(Date.now()+Math.min(3600,2**job.attempts*60)*1000).toISOString(),locked_until:null,last_error:e instanceof DeliveryUncertain?'Provider outcome is uncertain; review before retrying.':'Provider unavailable or not configured.'}).eq('id',job.id);if(saveError)throw saveError;}
 }
 return {sent,failed};
}
