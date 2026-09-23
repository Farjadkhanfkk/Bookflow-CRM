import { updateSession } from '@/lib/supabase-proxy';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Proxy (formerly middleware).
 * Runs before matched requests and guards the protected /dashboard routes.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = { matcher: ['/dashboard/:path*', '/login', '/reset-password', '/api/crm/:path*', '/api/settings/:path*', '/api/google/:path*'] };
