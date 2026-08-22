'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { login } from '@/lib/auth/actions';
import type { LoginState } from '@/lib/auth/actions';

const initialLoginState: LoginState = { error: null };

interface LoginFormProps {
  nextUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ nextUrl = '/dashboard' }) => {
  const [state, formAction, isPending] = useActionState(login, initialLoginState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-[#2D302E]">
      {/* Top Overline Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#F0EDE8] bg-white/80 backdrop-blur-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6E6B] hover:text-[#2D302E] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#8B9D83]" />
          <span>Back to Lumina Med Spa</span>
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B9D83]">
          BookFlow CRM
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand Mark */}
          <div className="text-center mb-8 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1A1C1A] text-[#8B9D83] flex items-center justify-center shadow-lg border border-[#2D302E]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-light serif text-[#1A1C1A]">
              Staff Sign In
            </h1>
            <p className="text-sm text-[#6B6E6B] max-w-sm mx-auto">
              Access the Lumina Med Spa operations dashboard. Authorized personnel only.
            </p>
          </div>

          {/* Sign In Card */}
          <form
            action={formAction}
            className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xl p-6 sm:p-8 space-y-5"
          >
            <input type="hidden" name="next" value={nextUrl} />

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B6E6B]"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@luminamedspa.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] placeholder:text-[#B9B6AF] focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/40 focus:border-[#8B9D83] transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[#6B6E6B]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] placeholder:text-[#B9B6AF] focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/40 focus:border-[#8B9D83] transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#8B8D8B] hover:text-[#2D302E] rounded-lg hover:bg-[#F5F7F4] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {state?.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}
{/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#8B9D83] text-white text-sm font-semibold hover:bg-[#7A8C72] active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In to Dashboard</>
              )}
            </button>

            <p className="text-center text-[10px] text-[#B9B6AF] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              Protected by Supabase Auth
            </p>
          </form>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-[10px] text-[#B9B6AF] border-t border-[#F0EDE8]">
        Lumina Med Spa · 428 Beverly Hills Boulevard, Suite 300
      </footer>
    </div>
  );
};