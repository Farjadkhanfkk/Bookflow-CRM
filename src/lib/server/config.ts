import 'server-only';
import { z } from 'zod';

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  APP_URL: z.string().url(),
  BOOKING_TOKEN_SECRET: z.string().min(32),
  BUSINESS_ID: z.string().uuid().default('00000000-0000-4000-8000-000000000001'),
});
export function config() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) throw new Error('Server configuration is incomplete');
  return parsed.data;
}
export function secret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error('Integration is not configured');
  return value;
}
