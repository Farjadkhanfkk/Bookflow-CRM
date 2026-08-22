import { supabase } from './supabase';
import {
  Service,
  TeamMember,
  AppointmentInsert,
  BookingCustomerOption,
} from '@/types';

/** Minimal row shapes returned by our Supabase queries. */

interface ServiceRow {
  id: string;
  name: string;
  category: string;
  price: string | number;
  duration_minutes?: number;
}

interface StaffRow {
  id: string;
  name: string;
  title?: string;
  role?: string;
}

interface ConflictRow {
  appointment_time: string;
}

/** Normalize a service row from Supabase into the app Service shape. */
export const normalizeServiceRow = (row: ServiceRow): Service => {
  const priceStr = typeof row.price === 'number'
    ? String(row.price)
    : String(row.price || '');
  const startingPriceNumber = parseInt(priceStr.replace(/[^0-9.]/g, ''), 10) || 0;

  return {
    id: row.id,
    name: row.name,
    category: (row.category as Service['category']) || 'facials',
    tagline: '',
    description: '',
    price: priceStr,
    startingPriceNumber,
    duration: `${row.duration_minutes || 60} min`,
    downtime: '',
    idealFor: [],
    benefits: [],
    image: '',
  };
};

/** Normalize a staff row from Supabase into the app TeamMember shape. */
export const normalizeStaffRow = (row: StaffRow): TeamMember => ({
  id: row.id,
  name: row.name,
  title: row.title || '',
  role: row.role || '',
  credentials: '',
  experience: '',
  bio: '',
  avatar: '',
  specialties: [],
  favoriteTreatment: '',
  quote: '',
  education: '',
});

/** Fetch all services and staff members for appointment booking. */
export async function fetchBookingData(): Promise<{
  services: Service[];
  staff: TeamMember[];
}> {
  const [svcRes, staffRes] = await Promise.all([
    supabase.from('services').select('id, name, category, price, duration_minutes'),
    supabase.from('staff_members').select('id, name, title, role'),
  ]);

  if (svcRes.error) throw svcRes.error;
  if (staffRes.error) throw staffRes.error;

  return {
    services: (svcRes.data || []).map(normalizeServiceRow),
    staff: (staffRes.data || []).map(normalizeStaffRow),
  };
}

/** Parse a date-time string (possibly local) to a normalized UTC ISO string. */
export function toISODateTime(dateStr: string, timeLabel: string): string {
  const datePart = dateStr; // e.g. "2026-08-17"
  // Convert time like "10:00 AM" to 24-hour
  const timeMatch = timeLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!timeMatch) return `${datePart}T12:00:00`;

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const timePart = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  return `${datePart}T${timePart}`;
}

/** Convert ISO datetime to "YYYY-MM-DD" */
export function toDateStr(iso: string): string {
  return iso.split('T')[0];
}

/** Convert ISO datetime to "HH:MM AM/PM" */
export function toTimeLabel(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Check whether a staff member has any overlapping appointments at the given
 * date/time. Returns an array of overlapping appointment times (empty => no conflict).
 */
export async function checkConflicts(
  staffId: string,
  dateTime: string,
  durationMinutes: number,
  excludeId?: string,
): Promise<string[]> {
  const start = new Date(dateTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  let query = supabase
    .from('appointments')
    .select('appointment_time, duration_minutes')
    .eq('staff_id', staffId)
    .neq('status', 'cancelled');

  if (excludeId) query = query.neq('id', excludeId);

  const { data, error } = await query;
  if (error) throw error;

  const conflicts: string[] = [];
  (data || []).forEach((apt: { appointment_time: string; duration_minutes?: number }) => {
    const aptStart = new Date(apt.appointment_time);
    const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 60) * 60 * 1000);
    // Overlap condition: aptStart < end AND start < aptEnd
    if (aptStart < end && start < aptEnd) {
      conflicts.push(toTimeLabel(apt.appointment_time));
    }
  });

  return conflicts;
}

/** Insert a new appointment into the Supabase appointments table. */
export async function createAppointmentRecord(insert: AppointmentInsert): Promise<string> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(insert)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/** Generate time-slot options from 8:00 AM to 8:00 PM. */
export function generateTimeSlots(_date?: string, intervalMinutes = 60): string[] {
  const slots: string[] = [];
  const startHour = 8;
  const endHour = 20;

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h % 12 || 12;
      slots.push(`${displayHour}:${String(m).padStart(2, '0')} ${ampm}`);
    }
  }

  return slots;
}

/** Compute end-time label given a start ISO datetime and duration in minutes. */
export function computeEndTimeLabel(isoStart: string, durationMinutes: number): string {
  const end = new Date(new Date(isoStart).getTime() + durationMinutes * 60 * 1000);
  let hours = end.getHours();
  const minutes = end.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/** Parse duration string like "60 min" into minutes. */
export function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

/** Fetch customers for the staff booking dropdown. */
export async function fetchCustomersForBooking(): Promise<BookingCustomerOption[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, email, phone')
    .order('full_name');

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    name: row.full_name || 'Unknown',
    email: row.email || '',
    phone: row.phone || '',
  }));
}

/** Find an existing customer by email or create a new one. Returns the customer id. */
export async function findOrCreateCustomer(details: {
  name: string;
  email: string;
  phone: string;
}): Promise<string> {
  const email = details.email.trim().toLowerCase();

  if (email) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing?.id) return existing.id;
  }

  const { data: created, error } = await supabase
    .from('customers')
    .insert([{
      full_name: details.name.trim(),
      email: email || null,
      phone: details.phone.trim() || null,
    }])
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

export type { AppointmentInsert };
