export type ServiceCategory = 'all' | 'facials' | 'injectables' | 'lasers' | 'body-wellness';

export interface Service {
  id: string;
  name: string;
  category: 'facials' | 'injectables' | 'lasers' | 'body-wellness';
  tagline: string;
  description: string;
  price: string;
  startingPriceNumber: number;
  duration: string;
  downtime: string;
  idealFor?: string[];
  benefits: string[];
  image: string;
  popular?: boolean;
  featured?: boolean;
  procedureSteps?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  credentials: string;
  experience: string;
  bio: string;
  avatar: string;
  specialties?: string[];
  favoriteTreatment: string;
  quote: string;
  education: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  treatment: string;
  specialist: string;
  rating: number;
  date: string;
  text: string;
  verifiedBookFlow: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'treatments' | 'booking' | 'aftercare';
}

export interface BookingState {
  serviceId: string;
  specialistId: string;
  date: string;
  timeSlot: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  isFirstVisit: boolean;
}

export type AppointmentStatus = 'confirmed' | 'in_progress' | 'checked_in' | 'completed' | 'pending_payment' | 'cancelled';

export interface CRMAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: 'facials' | 'injectables' | 'lasers' | 'body-wellness';
  specialistId: string;
  specialistName: string;
  date: string; // e.g. "2026-08-16" or "Today"
  startTime: string; // "10:00 AM"
  endTime: string; // "11:00 AM"
  durationMinutes: number;
  room: string; // "Suite 1 - Clinical Laser", "Suite 2 - Aesthetic", etc.
  status: AppointmentStatus;
  price: number;
  paymentStatus: 'paid' | 'pending' | 'deposit_only' | 'refunded';
  depositAmount?: number;
  notes?: string;
  medicalAlerts?: string[];
  isFirstVisit?: boolean;
  intakeFormCompleted: boolean;
}

export interface CRMPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipTier: 'Standard' | 'Privilege VIP' | 'Founder Circle';
  joinDate: string;
  createdAt: string;
  totalSpend: number;
  visitsCount: number;
  lastVisit: string;
  preferredSpecialistId: string;
  skinType: string;
  allergies: string[];
  recentTreatments: {
    serviceName: string;
    date: string;
    specialistName: string;
    price: number;
  }[];
  notes: string;
  status: 'active' | 'inactive' | 'lead';
}

export interface QuickStatMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
  iconName: string;
}

export interface ClinicRoom {
  id: string;
  name: string;
  type: string;
  currentStatus: 'occupied' | 'available' | 'cleaning' | 'reserved';
  currentAppointment?: string;
  currentSpecialist?: string;
}

export interface CustomerAppointmentHistory {
  id: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  specialistId: string;
  specialistName: string;
  date: string; // local e.g. "2026-08-16"
  time: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  paymentStatus: 'paid' | 'pending' | 'deposit_only' | 'refunded';
  notes?: string;
}

/**
 * A customer directory row: the mock-compatible CRMPatient shape
 * enriched with live data fetched from Supabase.
 */
export interface CustomerDirectoryEntry extends CRMPatient {
  appointmentHistory: CustomerAppointmentHistory[];
}

/** Payload for inserting a new appointment into Supabase. */
export interface AppointmentInsert {
  customer_id: string;
  service_id: string;
  staff_id: string;
  appointment_time: string;
  duration_minutes?: number;
  status?: AppointmentStatus;
  payment_status?: string;
  notes?: string;
}

/** Lightweight customer row for the staff booking dropdown. */
export interface BookingCustomerOption {
  id: string;
  name: string;
  email: string;
  phone: string;
}
