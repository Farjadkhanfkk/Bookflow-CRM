import { config,secret } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { checkOrigin,handle,HttpError,json,requireMember } from '@/lib/server/http';
import { decrypt,encrypt,providerFetch,refreshBusy } from '@/lib/server/providers';
import { equalSecret,hashToken,newToken } from '@/lib/server/security';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request:Request,context:{params:Promise<{action:string}>}){
 return handle(async()=>{
  const m=await requireMember();if(!m.staffId)throw new HttpError(400,'Link this account to a provider in business membership configuration first.');
  const {action}=await context.params;const jar=await cookies();const db=adminDb();const callback=`${config().APP_URL}/api/google/callback`;
  if(action==='connect'){
   const state=newToken();const {error}=await db.from('oauth_states').insert({state_hash:hashToken(state),user_id:m.user.id,staff_id:m.staffId,expires_at:new Date(Date.now()+600000).toISOString()});if(error)throw error;
   jar.set('google_oauth_state',state,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/google',maxAge:600});
   const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:secret('GOOGLE_CLIENT_ID'),redirect_uri:callback,response_type:'code',scope:'https://www.googleapis.com/auth/calendar.events',access_type:'offline',prompt:'consent',state}).toString();
   return NextResponse.redirect(url);
  }
  if(action==='callback'){
   const url=new URL(request.url);const state=url.searchParams.get('state')??'';const code=url.searchParams.get('code');
   if(!state||!code||!equalSecret(state,jar.get('google_oauth_state')?.value??''))throw new HttpError(400,'Invalid calendar authorization state.');
   jar.delete('google_oauth_state');
   const {data,error}=await db.from('oauth_states').delete().eq('state_hash',hashToken(state)).eq('user_id',m.user.id).gt('expires_at',new Date().toISOString()).select('staff_id').maybeSingle();
   if(error||!data||data.staff_id!==m.staffId)throw new HttpError(400,'Calendar authorization expired.');
   const response=await providerFetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({code,client_id:secret('GOOGLE_CLIENT_ID'),client_secret:secret('GOOGLE_CLIENT_SECRET'),redirect_uri:callback,grant_type:'authorization_code'})});
   const tokens=await response.json() as {refresh_token?:string};if(!tokens.refresh_token)throw new HttpError(400,'Offline calendar access was not granted. Reconnect with consent.');
   const {error:saveError}=await db.from('google_calendar_connections').upsert({staff_id:m.staffId,encrypted_refresh_token:encrypt(tokens.refresh_token),calendar_id:'primary',synced_at:null});if(saveError)throw saveError;
   await refreshBusy(m.staffId);
   return NextResponse.redirect(`${config().APP_URL}/dashboard`);
  }
  throw new HttpError(404,'Not found.');
 });
}
export async function POST(request:Request,context:{params:Promise<{action:string}>}){
 return handle(async()=>{
  checkOrigin(request);const m=await requireMember();if(!m.staffId)throw new HttpError(400,'No provider is linked.');
  const {action}=await context.params;if(action!=='disconnect')throw new HttpError(404,'Not found.');
  const db=adminDb();const {data,error}=await db.from('google_calendar_connections').select('encrypted_refresh_token').eq('staff_id',m.staffId).maybeSingle();if(error)throw error;
  if(data)await providerFetch('https://oauth2.googleapis.com/revoke',{method:'POST',body:new URLSearchParams({token:decrypt(data.encrypted_refresh_token)})});
  const {error:removeError}=await db.from('google_calendar_connections').delete().eq('staff_id',m.staffId);if(removeError)throw removeError;
  const {error:busyError}=await db.from('external_busy_blocks').delete().eq('staff_id',m.staffId);if(busyError)throw busyError;
  return json({disconnected:true});
 });
}
