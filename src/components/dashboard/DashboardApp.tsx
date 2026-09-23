'use client';

import { logout } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';
import React from 'react';
import { StaffDashboard } from './StaffDashboard';

interface DashboardAppProps {
  userEmail?: string;
  role?: import('@/lib/validation').Role;
}

/**
 * Client wrapper for the protected dashboard route.
 * Supplies navigation + logout behaviour to the StaffDashboard shell.
 */
export const DashboardApp: React.FC<DashboardAppProps> = ({ userEmail, role }) => {
  const router = useRouter();

  return (
    <StaffDashboard
      userEmail={userEmail}
      role={role}
      onExitToPublicSite={() => router.push('/')}
      onLogout={async () => {
        try {
          await logout();
        } catch {
          // The logout action redirects to /login; a failed request surfaces below.
          router.push('/login');
        }
      }}
    />
  );
};