import {
AppointmentInsert,
Service,
TeamMember
} from '@/types';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from './supabase';

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


/** Normalize a service row from Supabase into the app Service shape. */
export const normalizeServiceRow = (row: ServiceRow): Service => {
  const priceStr = typeof row.price === 'number'
    ? String(row.price)
    : String(row.price || '');
  const startingPriceNumber = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

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

/** Convert ISO datetime to "YYYY-MM-DD" */
export function toDateStr(iso: string): string {
  return formatInTimeZone(iso, 'America/Los_Angeles', 'yyyy-MM-dd');
}

/** Convert ISO datetime to "HH:MM AM/PM" */
export function toTimeLabel(iso: string): string {
  return formatInTimeZone(iso, 'America/Los_Angeles', 'h:mm aa');
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
  return toTimeLabel(new Date(new Date(isoStart).getTime() + durationMinutes * 60000).toISOString());
}

/** Parse duration string like "60 min" into minutes. */
export function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

export type { AppointmentInsert };
