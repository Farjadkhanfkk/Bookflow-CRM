import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Role } from '@/lib/validation';
import 'server-only';
import { z } from 'zod';
import { config } from './config';
import { adminDb } from './db';
import { hashToken } from './security';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new HttpError(415, 'JSON is required.');
  const raw = await request.text();
  if (raw.length > 16000) throw new HttpError(413, 'Request is too large.');
  try { return schema.parse(JSON.parse(raw)); }
  catch { throw new HttpError(400, 'Please check the supplied details.'); }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
}
export async function handle(fn: () => Promise<Response>) {
  try { return await fn(); }
  catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    // Never include database/provider errors, tokens, or customer payloads in responses or logs.
    return json({ error: 'This service is temporarily unavailable. Please try again later.' }, 503);
  }
}
export function checkOrigin(request: Request) {
  if (request.headers.get('origin') !== new URL(config().APP_URL).origin) throw new HttpError(403, 'Request origin is not allowed.');
}
export async function rateLimit(request: Request, scope: string, limit = 30) {
  // Vercel supplies this header. Non-Vercel installs use a shared bucket unless a trusted proxy is configured.
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for') ?? 'unknown' : 'local';
  const { data, error } = await adminDb().rpc('take_rate_limit', { p_key: hashToken(`${scope}:${ip}`), p_limit: limit, p_seconds: 600 });
  if (error) throw error;
  if (!data) throw new HttpError(429, 'Too many requests. Please try again in a few minutes.');
}
export async function requireMember(roles: Role[] = ['owner', 'admin', 'receptionist', 'staff']) {
  const db = await createServerSupabaseClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) throw new HttpError(401, 'Please sign in.');
  const { data, error } = await db.from('business_members').select('role,business_id,staff_id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (error || !data || !roles.includes(data.role as Role)) throw new HttpError(403, 'This account does not have access.');
  return { user, db, role: data.role as Role, businessId: data.business_id as string, staffId: data.staff_id as string | null };
}
