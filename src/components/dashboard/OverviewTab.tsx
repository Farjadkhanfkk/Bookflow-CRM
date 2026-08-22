import React from 'react';
import {
  CalendarDays,
  Plus,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Building2,
  Activity,
  FileText,
  CreditCard,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { QuickStatsSection } from './QuickStatsSection';
import { CRMAppointment, ClinicRoom, AppointmentStatus, QuickStatMetric } from '../../types';
import { MOCK_ROOMS, MOCK_ACTIVITY_LOGS } from '../../data/crmData';

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

  const getRoomStatusColor = (status: ClinicRoom['currentStatus']) => {
    switch (status) {
      case 'occupied': return 'bg-emerald-500';
      case 'reserved': return 'bg-amber-500';
      case 'cleaning': return 'bg-blue-500';
      case 'available':
      default: return 'bg-stone-300';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'checkin': return <UserCheck className="w-3.5 h-3.5" />;
      case 'booking': return <CalendarDays className="w-3.5 h-3.5" />;
      case 'payment': return <CreditCard className="w-3.5 h-3.5" />;
      case 'intake': return <FileText className="w-3.5 h-3.5" />;
      default: return <Activity className="w-3.5 h-3.5" />;
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
        {/* Left: Today's Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#F9F8F6]">
              <div className="flex items-center gap-2.5 min-w-0">
                <CalendarDays className="w-4 h-4 text-[#8B9D83] shrink-0" />
                <h2 className="text-sm font-bold text-[#1A1C1A]">Today's Schedule</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] border border-[#E5E2DD] shrink-0">
                  {upcomingToday.length} upcoming
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onNewAppointment}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B9D83] text-white text-[11px] font-medium hover:bg-[#7A8C72] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Appointment</span>
                </button>
                <button
                  onClick={onNavigateToAppointments}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8B9D83] hover:text-[#6B7A64] transition-colors"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="divide-y divide-[#F9F8F6] max-h-[420px] overflow-y-auto">
              {upcomingToday.length > 0 ? (
                upcomingToday.map(apt => (
                  <button
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className="w-full text-left px-5 py-3.5 hover:bg-[#FDFCFB] transition-colors flex items-center gap-4"
                  >
                    {/* Time */}
                    <div className="w-16 shrink-0">
                      <span className="block text-[11px] font-bold text-[#1A1C1C]">{apt.startTime}</span>
                      <span className="block text-[10px] text-[#8B8D8B]">{apt.durationMinutes}m</span>
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#F5F7F4] border border-[#E5E2DD] text-[#8B9D83] flex items-center justify-center text-[11px] font-bold shrink-0">
                      {apt.patientName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1C1C] truncate">{apt.patientName}</p>
                      <p className="text-[11px] text-[#8B8D8B] truncate">
                        {apt.serviceName} - {apt.specialistName}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(apt.status).bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(apt.status).dot}`}></span>
                      {getStatusBadge(apt.status).label}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5F7F4] flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-[#8B9D83]" />
                  </div>
                  <p className="mt-3 text-sm text-[#8B8D8B]">No confirmed appointments scheduled.</p>
                  <button
                    onClick={onNewAppointment}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F7F4] hover:bg-[#8B9D83] hover:text-white text-[11px] font-medium text-[#2D302E] border border-[#E5E2DD] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Book First Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
{/* Right Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sanctuary Suites */}
          <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#8B9D83]" />
                <h2 className="text-sm font-bold text-[#1A1C1C]">Sanctuary Suites</h2>
              </div>
              <span className="text-[10px] font-semibold text-[#8B8D8B]">
                {MOCK_ROOMS.filter(r => r.currentStatus === 'occupied' || r.currentStatus === 'reserved').length}/{MOCK_ROOMS.length} active
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {MOCK_ROOMS.map(room => (
                <div key={room.id} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getRoomStatusColor(room.currentStatus)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-[#1A1C1C] truncate">{room.name}</p>
                    <p className="text-[10px] text-[#8B8D8B] truncate">{room.currentAppointment}</p>
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-[#B9B6AF] shrink-0">
                    {room.currentStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F9F8F6]">
              <h2 className="text-sm font-bold text-[#1A1C1C]">Recent Activity</h2>
            </div>
            <div className="divide-y divide-[#F9F8F6]">
              {MOCK_ACTIVITY_LOGS.map(activity => (
                <div key={activity.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F7F4] border border-[#E5E2DD] text-[#8B9D83] flex items-center justify-center shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold text-[#1A1C1C] truncate">{activity.action}</p>
                      <span className="text-[9px] text-[#B9B6AF] whitespace-nowrap">{activity.time}</span>
                    </div>
                    <p className="text-[10px] text-[#8B8D8B] mt-0.5">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};