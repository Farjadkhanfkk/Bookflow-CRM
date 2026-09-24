import { adminDb } from '@/lib/server/db';
import { body, checkOrigin, handle, json, requireMember } from '@/lib/server/http';
import { uuid } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  return handle(async () => {
    const m = await requireMember();
    const { data, error } = await m.db.from('staff_notifications').select('id,appointment_id,message,read_at,created_at').order('created_at',{ascending:false}).limit(100);
    if (error) throw error;
    return json({ notifications:data });
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const m = await requireMember();
    const input = await body(request,z.object({id:uuid}).strict());
    const { error } = await adminDb().from('staff_notifications').update({read_at:new Date().toISOString()}).eq('id',input.id).eq('user_id',m.user.id).eq('business_id',m.businessId);
    if (error) throw error;
    return json({ updated:true });
  });
}
