import { config,secret } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { handle,HttpError,json } from '@/lib/server/http';
import { processOutbox } from '@/lib/server/outbox';
import { refreshBusy } from '@/lib/server/providers';
import { equalSecret } from '@/lib/server/security';
export const maxDuration=300;
export async function GET(request:Request){
 return handle(async()=>{
  if(!equalSecret(request.headers.get('authorization')??'',`Bearer ${secret('CRON_SECRET')}`))throw new HttpError(401,'Unauthorized.');
  const {data,error}=await adminDb().from('staff_members').select('id').eq('business_id',config().BUSINESS_ID).eq('is_bookable',true);if(error)throw error;
  let calendarFailures=0;
  for(const staff of data??[]){try{await refreshBusy(staff.id);}catch{calendarFailures++;}}
  return json({...await processOutbox(),calendarFailures});
 });
}
