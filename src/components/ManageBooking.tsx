'use client';
import { api } from '@/lib/api-client';
import { useEffect,useState } from 'react';
import { BookingForm } from './BookingForm';
type Appointment = { timezone: string; location_name: string; id: string; appointment_time: string; duration_minutes: number; service_id: string; service_name_snapshot: string; status: string; payment_status: string };
export function ManageBooking({ token }: { token: string }) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState(''); const [reschedule, setReschedule] = useState(false);
  const [busy, setBusy] = useState(false); const [reload, setReload] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);
  useEffect(() => {
    let active = true;
    api<{ appointment: Appointment }>('/api/booking/view', { token }).then(r => { if (active) { setAppointment(r.appointment); setError(''); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [token, reload]);
  async function cancel() {
    setBusy(true); setError('');
    try { await api('/api/booking/cancel', { token }); setReload(v => v + 1); setConfirmCancel(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Cancellation failed.'); }
    finally { setBusy(false); }
  }
  function calendar() {
    if (!appointment) return;
    const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const text = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//BookFlow//EN','BEGIN:VEVENT',`UID:${appointment.id}@bookflow`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(new Date(appointment.appointment_time))}`,`DTEND:${stamp(new Date(Date.parse(appointment.appointment_time) + appointment.duration_minutes * 60000))}`,'SUMMARY:Lumina appointment','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar' }));
    const link = document.createElement('a'); link.href = url; link.download = 'appointment.ics'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {!appointment && !error && <p role="status">Loading your appointment…</p>}
    {appointment && <><div className="rounded-2xl border bg-white p-6 space-y-3"><h2 className="text-2xl font-serif">{appointment.service_name_snapshot}</h2><p>{new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short', timeZone: appointment.timezone }).format(new Date(appointment.appointment_time))} ({appointment.timezone}) · {appointment.location_name}</p><p>Status: {appointment.status.replaceAll('_',' ')} · Payment: {appointment.payment_status.replaceAll('_',' ')}</p><p className="text-sm text-stone-600">This private link gives access to this booking. Do not share it.</p></div>
      {appointment.status === 'confirmed' && <div className="flex flex-wrap gap-4"><button className="action-button" onClick={() => setReschedule(v => !v)}>Reschedule</button><button className="underline" onClick={calendar}>Add to calendar</button><button className="text-red-800 underline" onClick={() => setConfirmCancel(true)}>Cancel appointment</button></div>}
      {confirmCancel && <div className="rounded-xl border border-red-200 p-5 space-y-3"><p>Cancel this appointment and release its time? Eligible deposit refunds are queued for processing.</p><button disabled={busy} onClick={cancel} className="action-button">{busy ? 'Cancelling…' : 'Confirm cancellation'}</button><button onClick={() => setConfirmCancel(false)} className="ml-4 underline">Keep appointment</button></div>}
      {reschedule && appointment.status === 'confirmed' && <BookingForm manageToken={token} initialServiceId={appointment.service_id} onSuccess={() => { setReschedule(false); setReload(v => v + 1); }} />}
    </>}
  </div>;
}
