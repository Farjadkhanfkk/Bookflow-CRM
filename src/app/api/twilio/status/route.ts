import { config,secret } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { handle,HttpError,json } from '@/lib/server/http';
import { equalSecret } from '@/lib/server/security';
import { createHmac } from 'node:crypto';
export async function POST(request:Request){
 return handle(async()=>{
  const params=new URLSearchParams(await request.text());
  let input=`${config().APP_URL}/api/twilio/status`;for(const key of [...new Set(params.keys())].sort())input+=key+params.get(key);
  const expected=createHmac('sha1',secret('TWILIO_AUTH_TOKEN')).update(input).digest('base64');
  if(!equalSecret(expected,request.headers.get('x-twilio-signature')??''))throw new HttpError(403,'Invalid signature.');
  const sid=params.get('MessageSid');const status=params.get('MessageStatus');
  if(sid&&['failed','undelivered'].includes(status??'')){
   const {error}=await adminDb().from('outbox').update({status:'failed',last_error:'Messaging provider reported delivery failure.'}).eq('provider_id',sid);if(error)throw error;
  }
  return json({received:true});
 });
}
