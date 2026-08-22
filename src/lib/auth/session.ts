import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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
  return user;
}