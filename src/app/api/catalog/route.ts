import { config } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { handle,json } from '@/lib/server/http';

export async function GET() {
  return handle(async () => {
    const db = adminDb(); const id = config().BUSINESS_ID;
    const results = await Promise.all([
      db.from('services').select('id,slug,name,category,price_amount,deposit_amount,duration_minutes').eq('business_id', id).eq('is_active', true).order('name'),
      db.from('staff_members').select('id,name,title').eq('business_id', id).eq('is_bookable', true).order('name'),
      db.from('locations').select('id,name,address,timezone').eq('business_id', id).eq('is_active', true).order('name'),
      db.from('businesses').select('currency,cancellation_hours,horizon_days').eq('id', id).single(),
    ]);
    for (const r of results) if (r.error) throw r.error;
    return json({ services: results[0].data, staff: results[1].data, locations: results[2].data, business: results[3].data });
  });
}
