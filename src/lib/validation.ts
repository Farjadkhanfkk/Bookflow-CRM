import { z } from 'zod';

export const uuid = z.string().uuid();
export const token = z.string().regex(/^[A-Za-z0-9_-]{40,160}$/);
export const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  phone: z.string().trim().regex(/^\+?[\d ()-]{7,25}$/),
  notes: z.string().trim().max(1000).default(''),
  policyAccepted: z.literal(true),
  emailConsent: z.boolean().default(false),
  smsConsent: z.boolean().default(false),
  whatsappConsent: z.boolean().default(false),
}).strict();
export const slotSchema = z.object({
  serviceId: uuid, locationId: uuid, staffId: uuid.nullable().default(null),
  startsAt: z.string().datetime({ offset: true }),
  manageToken: token.optional(),
}).strict();
export const checkoutSchema = z.object({ holdId: uuid, token, customer: customerSchema }).strict();
export const availabilitySchema = z.object({
  serviceId: uuid, locationId: uuid, staffId: uuid.nullable().default(null),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v))),
  manageToken: token.optional(),
}).strict();
export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254),
  phone: z.string().trim().max(25).default(''), message: z.string().trim().min(10).max(2000),
  consent: z.literal(true), website: z.string().max(0).optional(),
}).strict();
export type CustomerInput = z.infer<typeof customerSchema>;
export type Role = 'owner' | 'admin' | 'receptionist' | 'staff';
export const statusTransitions: Record<string, readonly string[]> = {
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['completed'], completed: [], cancelled: [], no_show: [], pending_payment: ['cancelled'],
};
export function safeRedirect(value: string): string {
  return /^\/dashboard(?:[/?#]|$)/.test(value) && !/[\\\r\n]/.test(value) ? value : '/dashboard';
}
