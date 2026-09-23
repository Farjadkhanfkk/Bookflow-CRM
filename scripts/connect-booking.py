from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
def write(path, content):
    target = root / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')
write('src/components/BookingModal.tsx', ''''use client';
import { useEffect, useRef } from 'react';
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
''')
write('src/components/dashboard/NewAppointmentModal.tsx', ''''use client';
import { useEffect, useRef } from 'react';
import type { CustomerDirectoryEntry } from '@/types';
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
''')
p = root/'package.json'
data=json.loads(p.read_text())
data['engines']={'node': '>=24 <25'}
data['scripts'].update({'typecheck':'next typegen && tsc --noEmit','test':'vitest run','test:e2e':'playwright test'})
p.write_text(json.dumps(data,indent=2)+'\n')
with (root/'src/app/globals.css').open('a',encoding='utf-8') as f:
    f.write('''
/* Shared transactional forms keep the existing Lumina palette. */
.booking-form label { display: block; font-size: .9rem; font-weight: 500; }
.booking-form input:not([type=checkbox]), .booking-form select, .booking-form textarea { display: block; width: 100%; margin-top: .5rem; padding: .75rem; border: 1px solid #d6d3d1; border-radius: .75rem; background: white; color: #292524; }
.booking-form .check-label { display: flex; align-items: start; flex-wrap: wrap; gap: .5rem; }
.booking-form input[type=checkbox] { margin-top: .3rem; }
.action-button { background: #4d6347; color: white; border-radius: 2rem; padding: .8rem 1.5rem; font-weight: 600; }
button:disabled { opacity: .5; cursor: not-allowed; }
:focus-visible { outline: 3px solid #4d6347; outline-offset: 4px; }
dialog::backdrop { backdrop-filter: blur(3px); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
''')
