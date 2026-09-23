'use server';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { safeRedirect } from '@/lib/validation';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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

  if (!z.string().email().max(254).safeParse(email).success) return { error: 'Please enter a valid email address.' };
  if (!password) return { error: 'Please enter your password.' };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {

    return {
      error:
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : 'Sign-in is unavailable. Please try again.',
    };
  }

  const { data: member } = await supabase.from('business_members').select('role').eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '').eq('is_active', true).maybeSingle();
  if (!member) { await supabase.auth.signOut(); return { error: 'This account does not have staff access.' }; }
  const safeNext = safeRedirect(next);

  redirect(safeNext);
}

/**
 * Signs the current staff member out and clears the auth session cookie.
 */
export async function logout() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error('Sign-out failed. Please try again.');
  }

  redirect('/login');
}