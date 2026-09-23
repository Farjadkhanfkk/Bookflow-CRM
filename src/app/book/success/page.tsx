import { adminDb } from '@/lib/server/db';
import { manageToken } from '@/lib/server/security';
import Link from 'next/link';
export const metadata = { title: 'Payment status | Lumina', robots: { index: false, follow: false } };
export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let token: string | null = null;
  if (session_id && /^cs_[a-zA-Z0-9_]{20,250}$/.test(session_id)) {
    try {
      const { data } = await adminDb().from('booking_holds').select('id,status').eq('checkout_session_id', session_id).eq('status', 'converted').maybeSingle();
      if (data) token = manageToken(data.id);
    } catch { /* A return URL cannot confirm payment. */ }
  }
  return <main className="mx-auto max-w-xl p-8 space-y-5"><h1 className="text-3xl font-serif">{token ? 'Appointment confirmed' : 'Waiting for payment confirmation'}</h1><p>{token ? 'Save your private booking link below.' : 'Your appointment will be confirmed only after verified payment. Refresh this page in a moment. Please do not submit another payment.'}</p>{token ? <Link className="action-button inline-block" href={`/manage-booking/${token}`}>Manage appointment</Link> : <a className="underline" href={session_id ? `/book/success?session_id=${encodeURIComponent(session_id)}` : '/book'}>Check status again</a>}</main>;
}
