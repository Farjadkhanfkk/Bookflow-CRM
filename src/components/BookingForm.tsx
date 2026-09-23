'use client';
import { api } from '@/lib/api-client';
import type { CustomerDirectoryEntry } from '@/types';
import Link from 'next/link';
import { useEffect,useState } from 'react';

type Catalog = {
  services: { id: string; slug: string; name: string; duration_minutes: number; price_amount: number; deposit_amount: number }[];
  staff: { id: string; name: string }[];
  locations: { id: string; name: string; timezone: string }[];
  business: { currency: string; cancellation_hours: number; horizon_days: number };
};
type Slot = { starts_at: string; staff_id: string };
type Hold = { id: string; token: string; expiresAt: string; staffId: string; startsAt: string; depositAmount: number; priceAmount: number; currency: string };
const money = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);

export function BookingForm({ initialServiceId, initialSpecialistId, initialDate, initialCustomer, manageToken, onSuccess }: {
  initialServiceId?: string; initialSpecialistId?: string; initialDate?: string;
  initialCustomer?: CustomerDirectoryEntry | null; manageToken?: string; onSuccess?: () => void;
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [serviceId, setService] = useState('');
  const [locationId, setLocation] = useState('');
  const [staffId, setStaff] = useState('');
  const [date, setDate] = useState(initialDate ?? '');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [searched, setSearched] = useState(false);
  const [hold, setHold] = useState<Hold | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmedToken, setConfirmed] = useState('');
  const [expired, setExpired] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    api<Catalog>('/api/catalog').then(data => {
      if (!active) return;
      setCatalog(data); setError('');
      setService(data.services.find(s => s.id === initialServiceId || s.slug === initialServiceId)?.id ?? data.services[0]?.id ?? '');
      setLocation(data.locations[0]?.id ?? '');
      setStaff(data.staff.find(s => s.id === initialSpecialistId)?.id ?? '');
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [initialServiceId, initialSpecialistId, reload]);
  useEffect(() => {
    if (!hold) return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.floor((Date.parse(hold.expiresAt) - Date.now()) / 1000));
      setRemaining(seconds); setExpired(seconds === 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [hold]);
  const location = catalog?.locations.find(l => l.id === locationId);
  const service = catalog?.services.find(s => s.id === serviceId);
  const formatTime = (instant: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: location?.timezone ?? 'UTC' }).format(new Date(instant));
  async function search() {
    setBusy(true); setError(''); setSlots([]); setSearched(false);
    try {
      const result = await api<{ slots: Slot[] }>('/api/booking/availability', { serviceId, locationId, staffId: staffId || null, date, ...(manageToken ? { manageToken } : {}) });
      setSlots(result.slots); setSearched(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Availability could not be loaded.'); }
    finally { setBusy(false); }
  }
  async function reserve(slot: Slot) {
    setBusy(true); setError('');
    try {
      const result = await api<Hold>('/api/booking/hold', { serviceId, locationId, staffId: slot.staff_id, startsAt: slot.starts_at, ...(manageToken ? { manageToken } : {}) });
      setHold(result); setExpired(false); setRemaining(45 * 60);
    } catch (e) { setError(e instanceof Error ? e.message : 'The time could not be reserved.'); setSlots([]); setSearched(false); }
    finally { setBusy(false); }
  }
  async function release() {
    if (!hold) return;
    setBusy(true); setError('');
    try { await api('/api/booking/release', { holdId: hold.id, token: hold.token }); setHold(null); setSlots([]); setSearched(false); }
    catch (e) { setError(e instanceof Error ? e.message : 'Please wait for the hold to expire.'); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!hold) return;
    setBusy(true); setError('');
    try {
      if (manageToken) {
        await api('/api/booking/reschedule', { token: manageToken, holdId: hold.id, holdToken: hold.token });
        onSuccess?.(); setConfirmed(manageToken); return;
      }
      const data = new FormData(event.currentTarget);
      const result = await api<{ confirmed?: boolean; manageToken?: string; url?: string }>('/api/booking/checkout', {
        holdId: hold.id, token: hold.token, customer: {
          name: data.get('name'), email: data.get('email'), phone: data.get('phone'), notes: data.get('notes'),
          policyAccepted: data.get('policy') === 'on', emailConsent: data.get('emailConsent') === 'on', smsConsent: data.get('smsConsent') === 'on', whatsappConsent: data.get('whatsappConsent') === 'on',
        },
      });
      if (result.url) { window.location.assign(result.url); return; }
      if (result.confirmed && result.manageToken) { setConfirmed(result.manageToken); onSuccess?.(); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Booking could not be completed.'); }
    finally { setBusy(false); }
  }
  if (confirmedToken) return <div className="space-y-5 py-8 text-center"><h2 className="text-3xl font-serif">{manageToken ? 'Appointment rescheduled' : 'Your booking is confirmed'}</h2><p>Keep your private booking link to view, change, or cancel this appointment.</p><Link className="action-button inline-block" href={`/manage-booking/${confirmedToken}`}>Manage appointment</Link></div>;
  return <div className="booking-form space-y-5">
    <p className="text-sm text-stone-600">Portfolio demonstration. Use test details only. Availability and payment amounts are verified on the server.</p>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}{!catalog && <button className="ml-3 underline" onClick={() => setReload(v => v + 1)}>Retry</button>}</div>}
    {!catalog && !error && <p role="status">Loading booking options…</p>}
    {catalog && (!catalog.services.length || !catalog.locations.length || !catalog.staff.length) && <p className="rounded-xl bg-amber-50 p-4">Online booking is not open yet. Services, providers, and locations must be configured first.</p>}
    {catalog && catalog.services.length > 0 && catalog.locations.length > 0 && catalog.staff.length > 0 && <>
      {!hold ? <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>Treatment<select disabled={!!manageToken} value={serviceId} onChange={e => { setService(e.target.value); setSlots([]); setSearched(false); }}>{catalog.services.map(s => <option key={s.id} value={s.id}>{s.name} · {money(s.price_amount, catalog.business.currency)}</option>)}</select></label>
          <label>Location<select value={locationId} onChange={e => { setLocation(e.target.value); setSlots([]); setSearched(false); }}>{catalog.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
          <label>Provider<select value={staffId} onChange={e => { setStaff(e.target.value); setSlots([]); setSearched(false); }}><option value="">Any available provider</option>{catalog.staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Preferred date<input required type="date" value={date} onChange={e => { setDate(e.target.value); setSlots([]); setSearched(false); }} /></label>
        </div>
        <p className="text-sm">All times are shown in <strong>{location?.timezone}</strong>. {service?.duration_minutes} minute treatment.</p>
        <button className="action-button" disabled={busy || !date} onClick={search}>{busy ? 'Checking…' : 'Find available times'}</button>
        {searched && slots.length === 0 && <p role="status">No appointments are available for this selection. Try another date or provider.</p>}
        <div className="grid gap-2 sm:grid-cols-2" aria-label="Available times">{slots.map(slot => <button disabled={busy} className="rounded-xl border border-stone-300 p-3 text-left hover:bg-stone-100" key={`${slot.starts_at}-${slot.staff_id}`} onClick={() => reserve(slot)}>{formatTime(slot.starts_at)}<span className="block text-xs text-stone-600">{catalog.staff.find(s => s.id === slot.staff_id)?.name}</span></button>)}</div>
      </> : <>
        <div className="rounded-2xl bg-stone-100 p-5 space-y-2"><h3 className="text-xl font-serif">Review your appointment</h3><p>{service?.name} · {location?.name}</p><p>{formatTime(hold.startsAt)} ({location?.timezone})</p><p>{catalog.staff.find(s => s.id === hold.staffId)?.name}</p><p>Treatment: {money(hold.priceAmount, hold.currency)} · Deposit: {money(hold.depositAmount, hold.currency)}</p><p role="status">{expired ? 'Your hold has expired. Choose a new time.' : `Reserved for ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}</p><button className="underline" disabled={busy} onClick={release}>Choose another time</button></div>
        <form onSubmit={submit} className="space-y-4">
          {!manageToken && <>
            <label>Full name<input name="name" required maxLength={120} autoComplete="name" defaultValue={initialCustomer?.name} /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" defaultValue={initialCustomer?.email} /></label><label>Phone<input name="phone" type="tel" required maxLength={25} autoComplete="tel" defaultValue={initialCustomer?.phone} /></label></div>
            <label>Booking notes (optional)<textarea name="notes" maxLength={1000} placeholder="Please do not enter medical or other sensitive information." /></label>
            <label className="check-label"><input type="checkbox" name="emailConsent" />Send booking updates and reminders by email.</label>
            <label className="check-label"><input type="checkbox" name="smsConsent" />Send booking updates and reminders by SMS. Carrier charges may apply.</label>
            <label className="check-label"><input type="checkbox" name="whatsappConsent" />Send appointment updates and reminders through WhatsApp.</label>
          </>}
          <label className="check-label"><input type="checkbox" name="policy" required />I accept the <Link href="/booking-policy" target="_blank" className="underline">booking policy</Link> and <Link href="/privacy" target="_blank" className="underline">privacy notice</Link>.</label>
          <p className="text-sm text-stone-600">Online changes close {catalog.business.cancellation_hours} hours before the appointment. Payment confirmation may take a few moments.</p>
          <button className="action-button" disabled={busy || expired}>{busy ? 'Processing…' : manageToken ? 'Confirm new time' : hold.depositAmount > 0 ? 'Continue to secure payment' : 'Confirm booking'}</button>
        </form>
      </>}
    </>}
  </div>;
}
