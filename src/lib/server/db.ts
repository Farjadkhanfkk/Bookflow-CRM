import { createClient } from '@supabase/supabase-js';
import 'server-only';
import { config } from './config';

export function adminDb() {
  const env = config();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
