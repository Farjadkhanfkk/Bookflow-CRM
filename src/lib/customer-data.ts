import { supabase } from '@/lib/supabase';
import {
  AppointmentStatus,
  CustomerAppointmentHistory,
  CustomerDirectoryEntry,
} from '@/types';

/**
 * Returns the first non-empty value among a list of plausible column names.
 * Makes the directory resilient to naming differences in the seeded schema.
 */
function pickValue(row: Record<string, unknown> | null | undefined, keys: string[]): unknown {
  if (!row) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

function numericPrice(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeTier(value: unknown): CustomerDirectoryEntry['membershipTier'] {
  const tier = String(value ?? '').toLowerCase();
  if (tier.includes('founder')) return 'Founder Circle';
  if (
    tier.includes('vip') ||
    tier.includes('privilege') ||
    tier.includes('platinum') ||
    tier.includes('gold')
  ) {
    return 'Privilege VIP';
  }
  return 'Standard';
}

function normalizeCustomerStatus(value: unknown): CustomerDirectoryEntry['status'] {
  const status = String(value ?? '').toLowerCase();
  if (status === 'inactive' || status === 'lead') return status;
  return 'active';
}

function normalizeAppointmentStatus(value: unknown): AppointmentStatus {
  const status = String(value ?? '').toLowerCase();
  const allowed: AppointmentStatus[] = [
    'confirmed',
    'in_progress',
    'checked_in',
    'completed',
    'pending_payment',
    'cancelled',
  ];
  return allowed.includes(status as AppointmentStatus)
    ? (status as AppointmentStatus)
    : 'confirmed';
}

function normalizePaymentStatus(value: unknown): CustomerAppointmentHistory['paymentStatus'] {
  const status = String(value ?? '').toLowerCase();
  const allowed: CustomerAppointmentHistory['paymentStatus'][] = [
    'paid',
    'pending',
    'deposit_only',
    'refunded',
  ];
  return allowed.includes(status as CustomerAppointmentHistory['paymentStatus'])
    ? (status as CustomerAppointmentHistory['paymentStatus'])
    : 'pending';
}

function toLocalDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toTime(value: unknown): string {
  if (!value) return '--:--';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatJoinDate(value: unknown): string {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
}

function parseAllergies(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }
  return String(value ?? '')
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}
interface AppointmentJoinRow {
  id?: string;
  customer_id?: string | null;
  service_id?: string | null;
  staff_id?: string | null;
  appointment_time?: string | null;
  status?: string | null;
  payment_status?: string | null;
  notes?: string | null;
  services?: { name?: string | null; price?: string | number | null } | null;
  staff_members?: { name?: string | null } | null;
}

function buildHistory(
  rows: AppointmentJoinRow[],
  customerId: string
): CustomerAppointmentHistory[] {
  return rows
    .filter((row) => row.customer_id === customerId)
    .sort((a, b) => {
      const aTime = new Date(a.appointment_time ?? 0).getTime();
      const bTime = new Date(b.appointment_time ?? 0).getTime();
      return bTime - aTime;
    })
    .map((row) => ({
      id: row.id ?? '',
      serviceId: row.service_id ?? '',
      serviceName: row.services?.name ?? 'Treatment',
      servicePrice: numericPrice(row.services?.price),
      specialistId: row.staff_id ?? '',
      specialistName: row.staff_members?.name ?? 'Team',
      date: toLocalDate(row.appointment_time),
      time: toTime(row.appointment_time),
      status: normalizeAppointmentStatus(row.status),
      paymentStatus: normalizePaymentStatus(row.payment_status),
      notes: row.notes ?? undefined,
    }));
}

function normalizeCustomer(
  raw: Record<string, unknown>,
  historyRows: AppointmentJoinRow[]
): CustomerDirectoryEntry {
  const id = String(pickValue(raw, ['id']) ?? '');
  const history = buildHistory(historyRows, id);
  const completed = history.filter((item) => item.status === 'completed');

  // Lifetime spend: prefer live derivation from completed treatments, then the
  // declared total if the customers table happens to carry one.
  const liveSpend = completed.reduce((sum, item) => sum + item.servicePrice, 0);
  const declaredSpend = numericPrice(
    pickValue(raw, ['total_spend', 'lifetime_spend', 'lifetime_value', 'total_value'])
  );
  const totalSpend = Math.max(liveSpend, declaredSpend);

  return {
    id,
    name: String(pickValue(raw, ['full_name', 'name', 'display_name']) ?? 'Unnamed Customer'),
    email: String(pickValue(raw, ['email']) ?? ''),
    phone: String(pickValue(raw, ['phone', 'phone_number', 'mobile']) ?? ''),
    avatar: '',
    membershipTier: normalizeTier(pickValue(raw, ['membership_tier', 'vip_tier', 'tier'])),
    joinDate: formatJoinDate(pickValue(raw, ['created_at', 'joined_at', 'member_since'])),
    createdAt: String(pickValue(raw, ['created_at', 'joined_at', 'member_since']) ?? ''),
    totalSpend,
    visitsCount: history.filter((item) => item.status !== 'cancelled').length,
    lastVisit: completed[0] ? completed[0].date : '—',
    preferredSpecialistId: String(
      pickValue(raw, ['preferred_specialist_id', 'preferred_staff_id']) ?? ''
    ),
    skinType: String(pickValue(raw, ['skin_type', 'skin_profile']) ?? ''),
    allergies: parseAllergies(pickValue(raw, ['allergies', 'medical_allergies'])),
    recentTreatments: history.slice(0, 3).map((item) => ({
      serviceName: item.serviceName,
      date: item.date,
      specialistName: item.specialistName,
      price: item.servicePrice,
    })),
    notes: String(pickValue(raw, ['notes', 'clinical_notes']) ?? ''),
    status: normalizeCustomerStatus(pickValue(raw, ['status', 'customer_status'])),
    appointmentHistory: history,
  };
}

export interface CustomerDirectoryResult {
  customers: CustomerDirectoryEntry[];
  error: string | null;
}

/**
 * Loads every customer together with their full appointment history
 * (joined with services and staff members) from Supabase.
 */
export async function fetchCustomersWithHistory(): Promise<CustomerDirectoryResult> {
  try {
    const [customerRes, historyRes] = await Promise.all([
      supabase.from('customers').select('*'),
      supabase
        .from('appointments')
        .select(
          'id, customer_id, service_id, staff_id, appointment_time, status, payment_status, notes, services(name, price), staff_members(name)'
        ),
    ]);

    if (customerRes.error) throw customerRes.error;
    if (historyRes.error) throw historyRes.error;

    const customers = (customerRes.data ?? []).map((row) =>
      normalizeCustomer(
        row as Record<string, unknown>,
        (historyRes.data ?? []) as AppointmentJoinRow[]
      )
    );

    return { customers, error: null };
  } catch (err) {
    if (err && typeof err === 'object' && 'message' in err) {
      console.error('Error loading customer directory:', {
        message: (err as any).message,
        details: (err as any).details,
        hint: (err as any).hint,
        code: (err as any).code,
      });
    } else {
      console.error('Error loading customer directory:', err);
    }
  }

  return {
    customers: [],
    error: 'We could not load customer records. Please check your connection and try again.',
  };
}

/** Insert a new customer into Supabase. */
export async function createCustomer(details: {
  full_name: string;
  email?: string;
  phone?: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('customers')
    .insert([{ full_name: details.full_name.trim(), email: details.email?.trim() || null, phone: details.phone?.trim() || null }])
    .select('id')
    .single();

  if (error) throw error;
  return { id: data.id };
}