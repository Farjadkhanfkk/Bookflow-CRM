from pathlib import Path
root=Path(__file__).resolve().parents[1]
def write(path,s): (root/path).write_text(s,encoding='utf-8')
write('src/lib/supabase.ts', '''import { createBrowserClient } from '@supabase/ssr';
// Placeholder URL is never used for successful operations; it lets the marketing
// site render when configuration is absent. No fallback points at a real project.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unconfigured.invalid',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'unconfigured-public-key',
);
''')
p=root/'src/lib/supabase-server.ts'
s=p.read_text(); s="import 'server-only';\n"+s
s=s.replace("if (!supabaseUrl || !supabaseAnonKey) {\n  console.warn('Supabase environment variables are not set.');\n}\n",'')
s=s.replace('const cookieStore = await cookies();',"if (!supabaseUrl || !supabaseAnonKey) throw new Error('Authentication is not configured');\n  const cookieStore = await cookies();")
p.write_text(s)
write('src/lib/supabase-proxy.ts', '''import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const db = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(values) {
      values.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  } });
  const { data: { user } } = await db.auth.getUser();
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const destination = request.nextUrl.clone(); destination.pathname = '/login'; destination.search = '';
    destination.searchParams.set('next', request.nextUrl.pathname);
    const redirect = NextResponse.redirect(destination);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}
''')
p=root/'src/proxy.ts'; s=p.read_text(); s=s[:s.index('export const config')]+"export const config = { matcher: ['/dashboard/:path*', '/login', '/reset-password', '/api/crm/:path*', '/api/settings/:path*', '/api/google/:path*'] };\n";p.write_text(s)
p=root/'src/lib/auth/session.ts';s=p.read_text();s=s.replace('  return user;','  return user;',1);s=s.replace("  if (!user) redirect('/login');\n  return user;", "  if (!user) redirect('/login');\n  const db = await createServerSupabaseClient();\n  const { data: member } = await db.from('business_members').select('role').eq('user_id', user.id).eq('is_active', true).maybeSingle();\n  if (!member) redirect('/login?error=access');\n  return user;");p.write_text(s)
p=root/'src/lib/auth/actions.ts';s=p.read_text();s=s.replace("import { redirect }", "import { z } from 'zod';\nimport { safeRedirect } from '@/lib/validation';\nimport { redirect }")
s=s.replace("if (!email) return { error: 'Please enter your email address.' };", "if (!z.string().email().max(254).safeParse(email).success) return { error: 'Please enter a valid email address.' };")
s=s.replace("    console.error('Supabase sign-in error:', error.message);",'')
s=s.replace(': error.message,', ": 'Sign-in is unavailable. Please try again.',")
start=s.index('  // Only allow local');end=s.index('\n  redirect(safeNext);',start)
s=s[:start]+'''  const { data: member } = await supabase.from('business_members').select('role').eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '').eq('is_active', true).maybeSingle();
  if (!member) { await supabase.auth.signOut(); return { error: 'This account does not have staff access.' }; }
  const safeNext = safeRedirect(next);
'''+s[end:]
s=s.replace("    console.error('Supabase sign-out error:', error.message);", "    throw new Error('Sign-out failed. Please try again.');")
p.write_text(s)
