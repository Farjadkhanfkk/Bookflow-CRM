import { BookingForm } from '@/components/BookingForm';
import Link from 'next/link';
export const metadata = { title: 'Book an appointment | Lumina' };
export default function BookPage() {
  return <main className="mx-auto w-full max-w-3xl px-5 py-12"><Link href="/" className="underline">← Lumina Med Spa</Link><h1 className="my-8 text-4xl font-serif">Your next appointment</h1><BookingForm /></main>;
}
