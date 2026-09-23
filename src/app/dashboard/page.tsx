import { DashboardApp } from '@/components/dashboard/DashboardApp';
import { requireUser } from '@/lib/auth/session';
import { requireMember } from '@/lib/server/http';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Dashboard | Lumina Med Spa BookFlow CRM',
  description: 'Lumina Med Spa BookFlow CRM staff dashboard.',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  // Server-side gate: unauthenticated users are redirected to /login.
  const user = await requireUser();

  const member = await requireMember();
  return <DashboardApp userEmail={user.email ?? ''} role={member.role} />;
}