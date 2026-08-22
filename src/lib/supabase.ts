import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://okmkvootptgqmhuhkjqv.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_NZvVSppk9wLLL9rubatmEA_gK7JA8US';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
