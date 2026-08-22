'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#8B9D83] animate-spin" />
        <p className="text-sm text-[#8B8D8B]">Loading dashboard...</p>
      </div>
    </div>
  );
}
