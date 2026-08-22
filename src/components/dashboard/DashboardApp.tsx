'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { StaffDashboard } from './StaffDashboard';
import { logout } from '@/lib/auth/actions';

interface DashboardAppProps {
  userEmail?: string;
}

/**
 * Client wrapper for the protected dashboard route.
 * Supplies navigation + logout behaviour to the StaffDashboard shell.
 */
export const DashboardApp: React.FC<DashboardAppProps> = ({ userEmail }) => {
  const router = useRouter();

  return (
    <StaffDashboard
      userEmail={userEmail}
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