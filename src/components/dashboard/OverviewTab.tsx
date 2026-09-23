import {
Activity,
AlertCircle,
CalendarDays,
CheckCircle2,
RefreshCw
} from 'lucide-react';
import React from 'react';

import { AppointmentStatus,CRMAppointment,QuickStatMetric } from '../../types';
import { QuickStatsSection } from './QuickStatsSection';

interface OverviewTabProps {
  stats: QuickStatMetric[];
  appointments: CRMAppointment[];
  error?: string | null;
  onRetry?: () => void;
  onSelectAppointment: (appointment: CRMAppointment) => void;
  onNewAppointment: () => void;
  onNavigateToCalendar: () => void;
  onNavigateToAppointments: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  appointments,
  error,
  onRetry,
  onSelectAppointment,
  onNewAppointment,
  onNavigateToCalendar,
  onNavigateToAppointments
}) => {
  // Current active sessions (in progress / in waiting lounge)
  const activeSessions = appointments.filter(
    a => a.status === 'in_progress' || a.status === 'checked_in'
  );

  // Upcoming (confirmed) appointments to feature on the schedule
  const upcomingToday = appointments
    .filter(a => a.status === 'confirmed')
    .slice(0, 5);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_progress':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600 animate-pulse', label: 'In Treatment' };
      case 'checked_in':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'In Waiting Lounge' };
      case 'confirmed':
        return { bg: 'bg-[#F5F7F4] text-[#2D302E] border-[#8B9D83]/30', dot: 'bg-[#8B9D83]', label: 'Scheduled' };
      case 'completed':
        return { bg: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Cancelled' };
      case 'pending_payment':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Pending Payment' };
      default:
        return { bg: 'bg-stone-50 text-stone-600 border-stone-200', dot: 'bg-stone-400', label: status };
    }
  };

  return (
    <div id="crm-overview-tab" className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 1. Quick Stats Header Section (live metrics) */}
      <QuickStatsSection
        stats={stats}
        onStatClick={(id) => {
          if (id === 'appointments-total') onNavigateToCalendar();
        }}
      />

      {/* 2. Live Sessions Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-[#1A1C1A]">{activeSessions.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6E6B]">Active sessions now</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5F7F4] border border-[#E5E2DD] text-[#8B9D83] flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-[#1A1C1A]">{appointments.length}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6E6B]">Total appointments</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold font-mono text-[#1A1C1A]">
              {appointments.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6E6B]">Completed</p>
          </div>
        </div>
      </div>
{/* 3. Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming appointments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#F0EDE8] p-5 space-y-4">
            <h2 className="text-sm font-bold">Current sessions</h2>
            {activeSessions.length === 0 && <p className="text-sm text-stone-600">No checked-in or active treatments.</p>}
            {activeSessions.map(appointment => <button key={appointment.id} className="block w-full text-left rounded-xl border p-3" onClick={() => onSelectAppointment(appointment)}><strong className="text-sm">{appointment.patientName}</strong><p className="text-xs">{appointment.serviceName} · {appointment.status.replaceAll('_',' ')}</p></button>)}
          </div>
        </div>
      </div>
    </div>
  );
};