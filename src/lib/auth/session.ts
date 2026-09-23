import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { cache } from 'react';

/**
 * Returns the authenticated Supabase user, or null when unauthenticated.
 * Memoized per request via React `cache`.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Verifies the session and redirects unauthenticated users to /login.
 * Use inside Server Components, Server Actions, and Route Handlers.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const db = await createServerSupabaseClient();
  const { data: member } = await db.from('business_members').select('role').eq('user_id', user.id).eq('is_active', true).maybeSingle();
  if (!member) redirect('/login?error=access');
  return user;
}