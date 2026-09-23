import { ManageBooking } from '@/components/ManageBooking';
import { token as tokenSchema } from '@/lib/validation';
import Link from 'next/link';
export const metadata = { title: 'Manage your booking | Lumina', robots: { index: false, follow: false }, referrer: 'no-referrer' as const };
export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <main className="mx-auto w-full max-w-3xl px-5 py-12"><Link href="/">← Lumina</Link><h1 className="my-8 text-4xl font-serif">Manage your appointment</h1>{tokenSchema.safeParse(token).success ? <ManageBooking token={token} /> : <p role="alert">This booking link is invalid or expired.</p>}</main>;
}
