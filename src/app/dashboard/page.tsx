import type { Metadata } from 'next';
import { DashboardApp } from '@/components/dashboard/DashboardApp';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Staff Dashboard | Lumina Med Spa BookFlow CRM',
  description: 'Lumina Med Spa BookFlow CRM staff dashboard.',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  // Server-side gate: unauthenticated users are redirected to /login.
  const user = await requireUser();

  return <DashboardApp userEmail={user.email ?? ''} />;
}