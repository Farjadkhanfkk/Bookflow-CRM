import { checkout,getManagedAppointment } from '@/lib/server/booking';
import { config } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { body,checkOrigin,handle,HttpError,json,rateLimit } from '@/lib/server/http';
import { refreshBusy } from '@/lib/server/providers';
import { hashToken,newToken } from '@/lib/server/security';
import { availabilitySchema,checkoutSchema,slotSchema,token,uuid } from '@/lib/validation';
import { z } from 'zod';

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  return handle(async () => {
    checkOrigin(request);
    const { action } = await context.params;
    await rateLimit(request, action, action === 'availability' ? 150 : 20);
    const db = adminDb();
    if (action === 'availability' || action === 'hold') {
      const input = action === 'hold' ? await body(request, slotSchema) : await body(request, availabilitySchema);
      const managed = input.manageToken ? await getManagedAppointment(input.manageToken) : null;
      const { data: service } = await db.from('services').select('id').eq('id', input.serviceId).eq('business_id', config().BUSINESS_ID).maybeSingle();
      if (!service) throw new HttpError(400, 'Invalid service.');
      const { data: providers, error: providersError } = await db.from('staff_members').select('id').eq('business_id', config().BUSINESS_ID).eq('is_bookable', true);
      if (providersError) throw providersError;
      for (const provider of providers ?? []) if (!input.staffId || provider.id === input.staffId) await refreshBusy(provider.id);
      if (action === 'availability' && 'date' in input) {
        const { data, error } = await db.rpc('available_slots', { p_service: input.serviceId, p_location: input.locationId, p_staff: input.staffId, p_date: input.date, p_ignore: managed?.id ?? null });
        if (error) throw error;
        return json({ slots: data });
      }
      if (!('startsAt' in input)) throw new HttpError(400, 'Choose a time.');
      const raw = newToken();
      const { data, error } = await db.rpc('create_booking_hold', {
        p_service: input.serviceId, p_location: input.locationId, p_staff: input.staffId, p_start: input.startsAt,
        p_token: hashToken(raw), p_reschedule: managed?.id ?? null, p_manage_hash: input.manageToken ? hashToken(input.manageToken) : null,
      });
      if (error) throw new HttpError(409, 'That time is unavailable. Please refresh availability.');
      return json({ id: data.id, token: raw, expiresAt: data.expires_at, staffId: data.staff_id, startsAt: data.starts_at, depositAmount: data.deposit_amount, priceAmount: data.price_amount, currency: data.currency });
    }
    if (action === 'checkout') {
      const input = await body(request, checkoutSchema);
      return json(await checkout(input.holdId, input.token, input.customer));
    }
    if (action === 'release') {
      const input = await body(request, z.object({ holdId: uuid, token }).strict());
      const { error } = await db.from('booking_holds').update({ status: 'cancelled' }).eq('id', input.holdId).eq('token_hash', hashToken(input.token)).eq('status', 'active').is('checkout_session_id', null);
      if (error) throw error;
      return json({ released: true });
    }
    if (action === 'view' || action === 'cancel' || action === 'reschedule') {
      const input = await body(request, z.object({ token, holdId: uuid.optional(), holdToken: token.optional() }).strict());
      const appointment = await getManagedAppointment(input.token);
      if (action === 'view') { const { data: location } = await db.from('locations').select('timezone,name').eq('id',appointment.location_id).maybeSingle(); return json({ appointment: { ...appointment, timezone: location?.timezone ?? 'UTC', location_name: location?.name ?? '' } }); }
      if (action === 'reschedule' && (!input.holdId || !input.holdToken)) throw new HttpError(400, 'Choose a replacement time first.');
      const { error } = await db.rpc('manage_appointment', { p_hash: hashToken(input.token), p_action: action, p_hold: input.holdId ?? null, p_hold_token: input.holdToken ? hashToken(input.holdToken) : null });
      if (error) throw new HttpError(409, 'This change is unavailable under the booking policy or the slot has expired.');
      return json({ updated: true });
    }
    throw new HttpError(404, 'Not found.');
  });
}
