'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#F0EDE8] shadow-2xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-[#1A1C1A] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[#6B6E6B] mb-6">
          {error?.message || 'The dashboard portal encountered an unexpected error.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B9D83] text-white text-xs font-semibold hover:bg-[#7A8C72] transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Portal
        </button>
      </div>
    </div>
  );
}
