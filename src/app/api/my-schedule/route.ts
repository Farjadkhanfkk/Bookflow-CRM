import { adminDb } from '@/lib/server/db';
import { body, checkOrigin, handle, HttpError, json, requireMember } from '@/lib/server/http';
import { uuid } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  return handle(async () => {
    const m = await requireMember();
    const db = adminDb();
    const { data: business, error } = await db.from('businesses').select('timezone').eq('id',m.businessId).single();
    if (error) throw error;
    if (!m.staffId) return json({ linked:false, timezone:business.timezone, blocks:[] });
    const { data: blocks, error: blocksError } = await db.from('staff_time_off').select('id,starts_at,ends_at,reason').eq('staff_id',m.staffId).gte('ends_at',new Date().toISOString()).order('starts_at');
    if (blocksError) throw blocksError;
    return json({ linked:true, timezone:business.timezone, blocks });
  });
}
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request);
    const m = await requireMember();
    if (!m.staffId) throw new HttpError(403, 'Your account must be linked to a provider.');
    const input = await body(request,z.discriminatedUnion('action',[
      z.object({ action:z.literal('add'), from:z.iso.date(), through:z.iso.date(), reason:z.string().trim().max(500) }).strict(),
      z.object({ action:z.literal('remove'), id:uuid }).strict(),
    ]));
    const { data, error } = input.action === 'add'
      ? await adminDb().rpc('set_my_unavailable',{p_actor:m.user.id,p_from:input.from,p_through:input.through,p_reason:input.reason})
      : await adminDb().rpc('remove_my_unavailable',{p_actor:m.user.id,p_id:input.id});
    if (error) throw new HttpError(409,'Could not update availability. Check the selected dates and try again.');
    return json({ saved:true, conflicts:data?.conflicts ?? 0 });
  });
}
