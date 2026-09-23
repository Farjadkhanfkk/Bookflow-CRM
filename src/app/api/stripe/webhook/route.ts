import { stripeClient } from '@/lib/server/booking';
import { secret } from '@/lib/server/config';
import { adminDb } from '@/lib/server/db';
import { handle,HttpError,json } from '@/lib/server/http';
import { hashToken,manageToken } from '@/lib/server/security';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  return handle(async () => {
    const stripe = stripeClient();
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(await request.text(), request.headers.get('stripe-signature') ?? '', secret('STRIPE_WEBHOOK_SECRET')); }
    catch { throw new HttpError(400, 'Invalid webhook signature.'); }
    const db = adminDb();
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      if (s.payment_status !== 'paid') return json({ received: true });
      const { data: hold, error } = await db.from('booking_holds').select('id,token_hash').eq('checkout_session_id', s.id).maybeSingle();
      if (error || !hold || s.metadata?.holdId !== hold.id) throw new HttpError(503, 'Checkout has not been linked yet.');
      const { error: fulfillError } = await db.rpc('confirm_booking', {
        p_hold: hold.id, p_token: hold.token_hash, p_manage_hash: hashToken(manageToken(hold.id)),
        p_session: s.id, p_intent: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id,
        p_amount: s.amount_total, p_currency: s.currency, p_event: event.id,
      });
      if (fulfillError) {
        if (fulfillError.code !== 'P0001' || !/Hold expired|Booking rules changed/.test(fulfillError.message)) throw fulfillError;
        const { error: refundError } = await db.rpc('record_unfulfilled_payment', {
          p_hold: hold.id, p_session: s.id, p_intent: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id,
          p_amount: s.amount_total, p_currency: s.currency, p_event: event.id,
        });
        if (refundError) throw refundError;
      }
    } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const { error } = await db.from('booking_holds').update({ status: 'expired' }).eq('checkout_session_id', event.data.object.id).eq('status', 'active');
      if (error) throw error;
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const intent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      const { error } = await db.rpc('record_refund', { p_intent: intent, p_amount: charge.amount_refunded, p_event: event.id });
      if (error) throw error;
    }
    return json({ received: true });
  });
}
