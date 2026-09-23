import type { CustomerInput } from '@/lib/validation';
import 'server-only';
import Stripe from 'stripe';
import { config,secret } from './config';
import { adminDb } from './db';
import { HttpError } from './http';
import { refreshBusy } from './providers';
import { hashToken,manageToken } from './security';

export function stripeClient() { return new Stripe(secret('STRIPE_SECRET_KEY'), { maxNetworkRetries: 2 }); }
export async function getManagedAppointment(raw: string) {
  const { data, error } = await adminDb().from('appointments').select('id,business_id,location_id,service_id,staff_id,appointment_time,duration_minutes,status,payment_status,service_name_snapshot,deposit_amount,currency,manage_expires_at')
    .eq('manage_token_hash', hashToken(raw)).gt('manage_expires_at', new Date().toISOString()).maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, 'This booking link is invalid or expired.');
  return data;
}
export async function checkout(holdId: string, raw: string, customer: CustomerInput) {
  const db = adminDb();
  const { data: h, error } = await db.from('booking_holds').select('*').eq('id', holdId).eq('token_hash', hashToken(raw)).maybeSingle();
  if (error) throw error;
  if (!h || h.reschedule_id) throw new HttpError(404, 'Invalid booking hold.');
  const manage = manageToken(h.id);
  if (h.status === 'converted') return { manageToken: manage, confirmed: true };
  if (h.status !== 'active' || Date.parse(h.expires_at) <= Date.now()) throw new HttpError(409, 'Your hold expired. Please choose a new time.');
  if (h.customer && JSON.stringify(h.customer) !== JSON.stringify(JSON.parse(JSON.stringify(customer)))) {
    // jsonb key order differs: compare values, not serialization order.
    if (Object.entries(customer).some(([key, value]) => h.customer[key] !== value)) throw new HttpError(409, 'This hold already has checkout details. Start a new booking to change them.');
  }
  const { error: saveError } = await db.from('booking_holds').update({ customer }).eq('id', h.id).is('customer', null);
  if (saveError) throw saveError;
  // Reload after compare-and-set to prevent concurrent checkouts binding different identities.
  const { data: bound, error: boundError } = await db.from('booking_holds').select('customer').eq('id', h.id).single();
  if (boundError) throw boundError;
  if (Object.entries(customer).some(([key, value]) => bound.customer[key] !== value)) throw new HttpError(409, 'Checkout details have changed. Start a new booking.');
  await refreshBusy(h.staff_id);
  if (h.deposit_amount === 0) {
    const { error: confirmError } = await db.rpc('confirm_booking', { p_hold: h.id, p_token: hashToken(raw), p_manage_hash: hashToken(manage) });
    if (confirmError) throw new HttpError(409, 'This slot is no longer available. Please choose another time.');
    return { manageToken: manage, confirmed: true };
  }
  const stripe = stripeClient();
  if (h.checkout_session_id) {
    const session = await stripe.checkout.sessions.retrieve(h.checkout_session_id);
    if (!session.url) throw new HttpError(409, 'Payment is processing or checkout has expired.');
    return { url: session.url };
  }
  if (Date.parse(h.expires_at) - Date.now() < 31 * 60000) throw new HttpError(409, 'Please select your time again to allow enough time for checkout.');
  const session = await stripe.checkout.sessions.create({
    mode: 'payment', payment_method_types: ['card'], customer_email: customer.email,
    client_reference_id: h.id, metadata: { holdId: h.id },
    expires_at: Math.floor(Date.parse(h.expires_at) / 1000),
    line_items: [{ quantity: 1, price_data: { currency: h.currency, unit_amount: h.deposit_amount, product_data: { name: `${h.service_name} — booking deposit` } } }],
    success_url: `${config().APP_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config().APP_URL}/book/expired`,
  }, { idempotencyKey: `booking:${h.id}` });
  const { error: linkError } = await db.from('booking_holds').update({ checkout_session_id: session.id }).eq('id', h.id);
  if (linkError) throw linkError;
  return { url: session.url };
}
