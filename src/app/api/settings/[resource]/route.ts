import { adminDb } from '@/lib/server/db';
import { body,checkOrigin,handle,HttpError,json,requireMember } from '@/lib/server/http';
import { settingsSchemas,type SettingsResource } from '@/lib/settings-schema';
import { uuid } from '@/lib/validation';
import { z } from 'zod';

const selections:Record<SettingsResource,string>={
  businesses:'id,name,timezone,currency,notice_hours,horizon_days,cancellation_hours,interval_minutes',
  locations:'id,name,address,timezone,is_active',services:'id,name,slug,category,duration_minutes,preparation_minutes,cleanup_minutes,price_amount,deposit_amount,is_active',
  staff_members:'id,name,title,is_bookable',staff_services:'staff_id,service_id',staff_locations:'staff_id,location_id',
  location_hours:'id,location_id,weekday,opens,closes',staff_availability:'id,staff_id,location_id,weekday,opens,closes',staff_time_off:'id,staff_id,starts_at,ends_at,reason',
};
async function resourceFrom(context:{params:Promise<{resource:string}>}) {
  const {resource}=await context.params;
  if (!Object.hasOwn(settingsSchemas,resource)) throw new HttpError(404,'Not found.');
  return resource as SettingsResource;
}
export async function GET(_request:Request,context:{params:Promise<{resource:string}>}) {
  return handle(async()=>{
    const resource=await resourceFrom(context);const m=await requireMember(['owner','admin']);const db=adminDb();
    let query=db.from(resource).select(selections[resource]);
    if(resource==='businesses')query=query.eq('id',m.businessId);
    else if(['locations','services','staff_members'].includes(resource))query=query.eq('business_id',m.businessId);
    else {
      const table=resource==='location_hours'?'locations':'staff_members';
      const {data,error}=await db.from(table).select('id').eq('business_id',m.businessId);if(error)throw error;
      query=query.in(resource==='location_hours'?'location_id':'staff_id',(data??[]).map(r=>r.id));
    }
    const {data,error}=await query.limit(1000);if(error)throw error;return json({rows:data});
  });
}
export async function POST(request:Request,context:{params:Promise<{resource:string}>}) {
  return handle(async()=>{
    checkOrigin(request);const resource=await resourceFrom(context);const m=await requireMember(['owner','admin']);
    const input=await body(request,z.object({id:uuid.optional(),values:z.record(z.string(),z.unknown()),remove:z.boolean().optional()}).strict());
    const parsed=settingsSchemas[resource].safeParse(input.values);if(!parsed.success)throw new HttpError(400,'Check field values, amounts, times, and assignments.');
    const {error}=await adminDb().rpc('save_configuration',{p_actor:m.user.id,p_resource:resource,p_id:input.id??null,p_values:parsed.data,p_remove:input.remove??false});
    if(error)throw new HttpError(409,'Configuration could not be saved. Check assignments and existing reservations.');
    return json({saved:true});
  });
}
