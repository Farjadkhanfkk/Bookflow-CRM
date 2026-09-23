import { config } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { body,checkOrigin,handle,json,rateLimit } from '@/lib/server/http';
import { leadSchema } from '@/lib/validation';
export async function POST(request: Request) {
  return handle(async () => {
    checkOrigin(request); await rateLimit(request, 'contact', 5);
    const input = await body(request, leadSchema);
    const { error } = await adminDb().rpc('create_lead', { p_business: config().BUSINESS_ID, p_name: input.name, p_email: input.email, p_phone: input.phone, p_message: input.message });
    if (error) throw error;
    return json({ received: true }, 201);
  });
}
