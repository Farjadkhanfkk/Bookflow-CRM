import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-proxy';

/**
 * Next.js 16 Proxy (formerly middleware).
 * Runs before matched requests and guards the protected /dashboard routes.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Run on all routes except static assets, images, and favicon.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};