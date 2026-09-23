'use client';
import { useEffect,useRef } from 'react';
import { BookingForm } from './BookingForm';
export function BookingModal({ isOpen, onClose, initialServiceId, initialSpecialistId }: {
  isOpen: boolean; onClose: () => void; initialServiceId?: string; initialSpecialistId?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (isOpen) ref.current?.showModal(); else ref.current?.close(); }, [isOpen]);
  return <dialog ref={ref} onCancel={onClose} onClose={onClose} className="m-auto w-[min(94vw,48rem)] max-h-[90dvh] rounded-3xl bg-[#FDFCFB] p-6 sm:p-8 backdrop:bg-black/50" aria-labelledby="booking-title">
    <div className="mb-6 flex items-center justify-between gap-4"><h2 id="booking-title" className="text-3xl font-serif">Reserve your appointment</h2><button aria-label="Close booking" onClick={onClose} className="rounded-full border px-3 py-2">✕</button></div>
    {isOpen && <BookingForm initialServiceId={initialServiceId} initialSpecialistId={initialSpecialistId} />}
  </dialog>;
}
