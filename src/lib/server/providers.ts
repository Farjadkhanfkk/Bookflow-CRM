import { createCipheriv,createDecipheriv,createHmac,randomBytes } from 'node:crypto';
import 'server-only';
import { config,secret } from './config';
import { adminDb } from './db';

export class DeliveryUncertain extends Error {}
export async function providerFetch(url:string,init:RequestInit={}) {
  const response=await fetch(url,{...init,signal:AbortSignal.timeout(12000),cache:'no-store'});
  if(!response.ok)throw new Error(`Provider request failed (${response.status})`);
  return response;
}
function encryptionKey(){const key=Buffer.from(secret('GOOGLE_TOKEN_ENCRYPTION_KEY'),'base64');if(key.length!==32)throw new Error('Invalid encryption configuration');return key;}
export function encrypt(value:string){const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',encryptionKey(),iv);const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64');}
export function decrypt(value:string){const raw=Buffer.from(value,'base64');const decipher=createDecipheriv('aes-256-gcm',encryptionKey(),raw.subarray(0,12));decipher.setAuthTag(raw.subarray(12,28));return Buffer.concat([decipher.update(raw.subarray(28)),decipher.final()]).toString('utf8');}
export async function googleAccess(staffId:string){
 const {data,error}=await adminDb().from('google_calendar_connections').select('encrypted_refresh_token,calendar_id').eq('staff_id',staffId).maybeSingle();
 if(error)throw error;if(!data)return null;
 const response=await providerFetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:secret('GOOGLE_CLIENT_ID'),client_secret:secret('GOOGLE_CLIENT_SECRET'),refresh_token:decrypt(data.encrypted_refresh_token),grant_type:'refresh_token'})});
 const tokens=await response.json() as {access_token?:string};if(!tokens.access_token)throw new Error('Calendar authorization failed');
 return {accessToken:tokens.access_token,calendarId:data.calendar_id};
}
type GoogleEvent={id?:string;status?:string;transparency?:string;start?:{dateTime?:string;date?:string};end?:{dateTime?:string;date?:string};extendedProperties?:{private?:{bookflow?:string}}};
export async function refreshBusy(staffId:string){
 const connection=await googleAccess(staffId);if(!connection)return;
 const blocks:{start:string;end:string}[]=[];let pageToken:string|undefined;
 for(let page=0;page<30;page++){
  const params=new URLSearchParams({timeMin:new Date().toISOString(),timeMax:new Date(Date.now()+366*86400000).toISOString(),singleEvents:'true',maxResults:'2500',timeZone:'UTC'});if(pageToken)params.set('pageToken',pageToken);
  const response=await providerFetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendarId)}/events?${params}`,{headers:{Authorization:`Bearer ${connection.accessToken}`}});
  const data=await response.json() as {items?:GoogleEvent[];nextPageToken?:string};
  for(const e of data.items??[]){
   if(e.status==='cancelled'||e.transparency==='transparent'||e.extendedProperties?.private?.bookflow==='true')continue;
   // All-day events are conservatively blocked over the entire UTC date plus adjacent offsets.
   const start=e.start?.dateTime??(e.start?.date?new Date(Date.parse(e.start.date)-14*3600000).toISOString():null);
   const end=e.end?.dateTime??(e.end?.date?new Date(Date.parse(e.end.date)+14*3600000).toISOString():null);
   if(start&&end)blocks.push({start,end});
  }
  pageToken=data.nextPageToken;if(!pageToken)break;
 }
 if(pageToken)throw new Error('Calendar exceeds synchronization limit');
 const {error}=await adminDb().rpc('replace_external_busy',{p_staff:staffId,p_blocks:blocks});if(error)throw error;
}
export async function email(to:string,text:string,key:string){
 const response=await providerFetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${secret('RESEND_API_KEY')}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:secret('RESEND_FROM_EMAIL'),to:[to],subject:'Lumina appointment update',text})});
 return (await response.json() as {id:string}).id;
}
export async function sms(to:string,text:string){
 const account=secret('TWILIO_ACCOUNT_SID');const auth=secret('TWILIO_AUTH_TOKEN');const from=secret('TWILIO_FROM_NUMBER');
 // Twilio does not guarantee idempotent message creation. An ambiguous network outcome
 // is held for operator review instead of automatically risking a duplicate message.
 try{
  const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`,{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`Basic ${Buffer.from(`${account}:${auth}`).toString('base64')}`},body:new URLSearchParams({From:from,To:to,Body:text,StatusCallback:`${config().APP_URL}/api/twilio/status`})});
  if(response.status>=500)throw new DeliveryUncertain('Message delivery needs review');
  if(!response.ok)throw new Error('Message provider rejected the request');
  try { return (await response.json() as {sid:string}).sid; } catch { throw new DeliveryUncertain('Message delivery needs review'); }
 }catch(e){if(e instanceof Error&&(e.name==='TimeoutError'||e.name==='TypeError'))throw new DeliveryUncertain('Message delivery needs review');throw e;}
}
export async function notifyN8n(eventId:string,eventType:string,appointmentId:string){
 const url=new URL(secret('N8N_WEBHOOK_URL'));if(url.protocol!=='https:')throw new Error('HTTPS webhook required');
 const payload=JSON.stringify({eventId,eventType,appointmentId});const timestamp=String(Math.floor(Date.now()/1000));
 const signature=createHmac('sha256',secret('N8N_WEBHOOK_SECRET')).update(`${timestamp}.${payload}`).digest('hex');
 await providerFetch(url.toString(),{method:'POST',headers:{'Content-Type':'application/json','X-BookFlow-Signature':signature,'X-BookFlow-Timestamp':timestamp,'Idempotency-Key':eventId},body:payload});
}

export async function whatsapp(to:string,bookingUrl:string) {
 const account=secret('TWILIO_ACCOUNT_SID');const auth=secret('TWILIO_AUTH_TOKEN');
 const sender=secret('TWILIO_WHATSAPP_FROM');const template=secret('TWILIO_WHATSAPP_TEMPLATE_SID');
 try {
  const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${account}/Messages.json`,{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`Basic ${Buffer.from(`${account}:${auth}`).toString('base64')}`},body:new URLSearchParams({From:sender,To:`whatsapp:${to}`,ContentSid:template,ContentVariables:JSON.stringify({'1':bookingUrl}),StatusCallback:`${config().APP_URL}/api/twilio/status`})});
  if(response.status>=500)throw new DeliveryUncertain('WhatsApp delivery needs review');
  if(!response.ok)throw new Error('WhatsApp template was rejected');
  try { return (await response.json() as {sid:string}).sid; } catch { throw new DeliveryUncertain('WhatsApp delivery needs review'); }
 } catch(e) { if(e instanceof Error&&(e.name==='TypeError'||e.name==='TimeoutError'))throw new DeliveryUncertain('WhatsApp delivery needs review');throw e; }
}
