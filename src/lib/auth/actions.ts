'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface LoginState {
  error: string | null;
}

/**
 * Signs a staff member in with email + password and establishes the
 * Supabase auth session cookie through the SSR client.
 */
export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');

  if (!email) return { error: 'Please enter your email address.' };
  if (!password) return { error: 'Please enter your password.' };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase sign-in error:', error.message);
    return {
      error:
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message,
    };
  }

  // Only allow local, non-auth redirect targets.
  const safeNext = next.startsWith('/') && !next.startsWith('//') && next !== '/login'
    ? next
    : '/dashboard';

  redirect(safeNext);
}

/**
 * Signs the current staff member out and clears the auth session cookie.
 */
export async function logout() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Supabase sign-out error:', error.message);
  }

  redirect('/login');
}