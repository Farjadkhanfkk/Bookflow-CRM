import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Sign In | Lumina Med Spa BookFlow CRM',
  description: 'Secure staff sign in for the Lumina Med Spa BookFlow CRM.',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Already authenticated users should not reach the login screen.

  const { next } = await searchParams;
  // Sanitize the return path so redirects can never point off-site.
  const safeNext =
    next && next.startsWith('/') && !next.startsWith('//') && next !== '/login'
      ? next
      : '/dashboard';

  return <LoginForm nextUrl={safeNext} />;
}