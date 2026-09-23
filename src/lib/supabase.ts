import { createBrowserClient } from '@supabase/ssr';
// Placeholder URL is never used for successful operations; it lets the marketing
// site render when configuration is absent. No fallback points at a real project.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unconfigured.invalid',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'unconfigured-public-key',
);
