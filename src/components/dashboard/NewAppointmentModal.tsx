'use client';
import type { CustomerDirectoryEntry } from '@/types';
import { useEffect,useRef } from 'react';
import { BookingForm } from '../BookingForm';
export function NewAppointmentModal({ isOpen, onClose, onSuccess, initialSpecialistId, initialDate, initialCustomer }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void; initialTime?: string;
  initialSpecialistId?: string; initialDate?: string; initialCustomer?: CustomerDirectoryEntry | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (isOpen) ref.current?.showModal(); else ref.current?.close(); }, [isOpen]);
  return <dialog ref={ref} onCancel={onClose} onClose={onClose} aria-labelledby="staff-booking-title" className="m-auto w-[min(94vw,48rem)] max-h-[90dvh] rounded-3xl bg-[#FDFCFB] p-6 backdrop:bg-black/50">
    <div className="flex justify-between gap-4 mb-5"><h2 id="staff-booking-title" className="font-serif text-3xl">New appointment</h2><button onClick={onClose} aria-label="Close new appointment">✕</button></div>
    {isOpen && <BookingForm initialSpecialistId={initialSpecialistId} initialDate={initialDate} initialCustomer={initialCustomer} onSuccess={onSuccess} />}
  </dialog>;
}
