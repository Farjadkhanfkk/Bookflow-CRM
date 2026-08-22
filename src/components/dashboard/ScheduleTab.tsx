"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Search,
  Loader2,
} from 'lucide-react';
import { CRMAppointment, AppointmentStatus, TeamMember } from '@/types';
import { fetchBookingData, generateTimeSlots } from '@/lib/appointment-data';

interface ScheduleTabProps {
  appointments: CRMAppointment[];
  onSelectAppointment: (appointment: CRMAppointment) => void;
  onNewAppointment: (time?: string, specialistId?: string, date?: string) => void;
  onUpdateStatus?: (appointmentId: string, newStatus: AppointmentStatus) => void;
}

function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function getStaffInitials(name: string): string {
  return name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

/** Parse a "h:mm AM/PM" or "HH:MM" time string into minutes since midnight (safe fallback to 08:00). */
function timeToMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 480;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  appointments,
  onSelectAppointment,
  onNewAppointment,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedSpecialistFilter, setSelectedSpecialistFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dayOffset, setDayOffset] = useState(0);
  const [staffMembers, setStaffMembers] = useState<TeamMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const selectedDate = useMemo(() => addDays(new Date(), dayOffset), [dayOffset]);
  const selectedDateStr = formatDateISO(selectedDate);

  const weekDays = useMemo(() => {
    const monday = startOfWeek(selectedDate);
    const todayStr = formatDateISO(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      const full = formatDateISO(d);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        full,
        isToday: full === todayStr,
      };
    });
  }, [selectedDate]);

  useEffect(() => {
    fetchBookingData()
      .then(({ staff }) => setStaffMembers(staff))
      .catch(console.error)
      .finally(() => setLoadingStaff(false));
  }, []);

  const filteredSpecialists =
    selectedSpecialistFilter === 'all'
      ? staffMembers
      : staffMembers.filter((m) => m.id === selectedSpecialistFilter);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedSpecialistFilter !== 'all' && apt.specialistId !== selectedSpecialistFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          apt.patientName.toLowerCase().includes(q) ||
          apt.serviceName.toLowerCase().includes(q) ||
          apt.specialistName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [appointments, selectedSpecialistFilter, searchQuery]);

  const dayAppointments = useMemo(
    () => filteredAppointments.filter((apt) => apt.date === selectedDateStr),
    [filteredAppointments, selectedDateStr],
  );

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_progress':
        return { bg: 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-600 animate-pulse', label: 'In Treatment' };
      case 'checked_in':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-800', dot: 'bg-amber-500', label: 'Checked In' };
      case 'confirmed':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500', label: 'Confirmed' };
      case 'completed':
        return { bg: 'bg-slate-100 border-slate-200 text-slate-600', dot: 'bg-slate-400', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-rose-50 border-rose-200 text-rose-700', dot: 'bg-rose-500', label: 'Cancelled' };
      case 'pending_payment':
        return { bg: 'bg-rose-50 border-rose-200 text-rose-700', dot: 'bg-rose-500', label: 'Pending Pay' };
      default:
        return { bg: 'bg-slate-50 border-slate-200 text-slate-600', dot: 'bg-slate-400', label: status };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'facials': return 'border-l-4 border-l-[#8B9D83]';
      case 'injectables': return 'border-l-4 border-l-purple-500';
      case 'lasers': return 'border-l-4 border-l-amber-500';
      case 'body-wellness': return 'border-l-4 border-l-cyan-600';
      default: return 'border-l-4 border-l-stone-400';
    }
  };

  const renderAppointmentCard = (apt: CRMAppointment, compact = false) => {
    const badge = getStatusBadge(apt.status);
    const categoryBorder = getCategoryColor(apt.serviceCategory);

    return (
      <div
        key={apt.id}
        onClick={() => onSelectAppointment(apt)}
        className={`rounded-xl p-2.5 bg-white border border-[#F0EDE8] ${categoryBorder} shadow-xs hover:shadow-md hover:border-[#8B9D83] transition-all cursor-pointer space-y-1.5 text-left ${compact ? 'p-2' : ''}`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono font-bold text-[#1A1C1A]">
            {apt.startTime} – {apt.endTime}
          </span>
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-[#1A1C1A] truncate">{apt.patientName}</h4>
          <p className="text-[11px] text-[#6B6E6B] truncate font-medium">{apt.serviceName}</p>
          {!compact && (
            <p className="text-[10px] text-[#8B8D8B]">{apt.durationMinutes} min · ${apt.price}</p>
          )}
        </div>
        {!compact && (
          <div className="flex items-center justify-between text-[10px] text-[#8B8D8B] pt-1 border-t border-[#F5F7F4]">
            <span className="truncate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#8B9D83] shrink-0" />
              {apt.specialistName}
            </span>
          </div>
        )}
        {(apt.status === 'confirmed' || apt.status === 'checked_in' || apt.status === 'in_progress') && (
          <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onUpdateStatus?.(apt.id, 'completed')}
              className="text-[9px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            >
              Complete
            </button>
            <button
              onClick={() => onUpdateStatus?.(apt.id, 'cancelled')}
              className="text-[9px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (loadingStaff) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#8B9D83] animate-spin" />
        <p className="mt-2 text-sm text-[#8B8D8B]">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div id="crm-schedule-tab" className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] p-1">
            <button
              onClick={() => setDayOffset((prev) => prev - (viewMode === 'week' ? 7 : 1))}
              className="p-1.5 rounded-lg hover:bg-white text-[#6B6E6B] hover:text-[#1A1C1A] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDayOffset(0)}
              className="px-3 py-1 text-xs font-semibold text-[#1A1C1A] hover:bg-white rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setDayOffset((prev) => prev + (viewMode === 'week' ? 7 : 1))}
              className="p-1.5 rounded-lg hover:bg-white text-[#6B6E6B] hover:text-[#1A1C1A] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#1A1C1A] flex items-center gap-2">
              <span>{dateLabel}</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] border border-[#F0EDE8]">
                {viewMode === 'day'
                  ? `${dayAppointments.length} appointment${dayAppointments.length !== 1 ? 's' : ''}`
                  : `${filteredAppointments.filter((a) => weekDays.some((d) => d.full === a.date)).length} this week`}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] placeholder:text-[#8B8D8B] focus:outline-hidden focus:border-[#8B9D83] w-36 sm:w-44"
            />
          </div>

          <select
            value={selectedSpecialistFilter}
            onChange={(e) => setSelectedSpecialistFilter(e.target.value)}
            className="text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] px-3 py-1.5 focus:outline-hidden focus:border-[#8B9D83]"
          >
            <option value="all">All Staff ({staffMembers.length})</option>
            {staffMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          <div className="flex items-center bg-[#F5F7F4] p-1 rounded-xl border border-[#F0EDE8]">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'day' ? 'bg-white text-[#1A1C1A] shadow-2xs font-semibold' : 'text-[#6B6E6B]'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'week' ? 'bg-white text-[#1A1C1A] shadow-2xs font-semibold' : 'text-[#6B6E6B]'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={() => onNewAppointment(undefined, undefined, selectedDateStr)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' ? (
        <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs overflow-hidden">
          {/* Header row */}
          <div
            className="grid border-b border-[#F0EDE8] bg-[#FDFCFB]"
            style={{ gridTemplateColumns: `80px repeat(${filteredSpecialists.length}, minmax(140px, 1fr))` }}
          >
            <div className="p-2 text-center text-[10px] font-semibold uppercase tracking-wider text-[#8B8D8B] border-r border-[#F0EDE8]">
              Time
            </div>
            {filteredSpecialists.map((specialist) => (
              <div
                key={specialist.id}
                className="p-2 border-r border-[#F0EDE8] last:border-r-0 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-[#F5F7F4] border border-[#8B9D83]/40 flex items-center justify-center text-[8px] font-bold text-[#8B9D83] shrink-0">
                  {getStaffInitials(specialist.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[10px] font-semibold text-[#1A1C1A] truncate">{specialist.name}</h3>
                  <p className="text-[9px] text-[#8B9D83] truncate">{specialist.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid Body (08:00 AM to 08:00 PM, 1px per minute) */}
          <div className="relative overflow-y-auto" style={{ height: '720px' }}>
            {filteredSpecialists.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-[#8B8D8B]">No staff members available to display the schedule.</p>
              </div>
            ) : (
              <>
                {/* Hour lines */}
                {timeSlots.map((timeSlot) => {
                  const top = timeToMinutes(timeSlot) - 480;
                  return (
                    <div
                      key={`line-${timeSlot}`}
                      className="absolute w-full border-t border-[#F9F8F6] pointer-events-none"
                      style={{ top: `${top}px` }}
                    >
                      <span className="text-[10px] text-[#8B8D8B] ml-2">{timeSlot}</span>
                    </div>
                  );
                })}

                {/* Specialist lanes */}
                {filteredSpecialists.map((specialist, specialistIndex) => {
                  const specialistAppointments = dayAppointments.filter(
                    (apt) => apt.specialistId === specialist.id
                  );

                  return (
                    <div
                      key={`lane-${specialist.id}`}
                      className="absolute top-0 bottom-0 border-r border-[#F0EDE8] last:border-r-0"
                      style={{
                        left: `calc(80px + ${specialistIndex} * ((100% - 80px) / ${filteredSpecialists.length}))`,
                        width: `calc((100% - 80px) / ${filteredSpecialists.length})`,
                      }}
                    >
                      {/* Clickable empty hour slots */}
                      {timeSlots.map((timeSlot) => {
                        const top = timeToMinutes(timeSlot) - 480;
                        return (
                          <button
                            key={`slot-${specialist.id}-${timeSlot}`}
                            onClick={() => onNewAppointment(timeSlot, specialist.id, selectedDateStr)}
                            className="absolute w-full hover:bg-[#8B9D83]/5 transition-colors"
                            style={{ top: `${top}px`, height: '60px' }}
                            title={`New appointment at ${timeSlot}`}
                          />
                        );
                      })}

                      {/* Appointment blocks */}
                      {specialistAppointments.map((apt) => {
                        const startMinutes = timeToMinutes(apt.startTime);
                        const top = Math.max(0, startMinutes - 480);
                        const height = Math.max(24, apt.durationMinutes);
                        const badge = getStatusBadge(apt.status);

                        return (
                          <div
                            key={apt.id}
                            onClick={() => onSelectAppointment(apt)}
                            className="absolute left-1 right-1 rounded-lg p-1.5 bg-white border border-[#F0EDE8] shadow-xs hover:shadow-md hover:border-[#8B9D83] transition-all cursor-pointer text-left overflow-hidden"
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[10px] font-semibold text-[#1A1C1A] truncate">{apt.patientName}</p>
                              <span className={`text-[8px] px-1 rounded-full border shrink-0 ${badge.bg}`}>{badge.label}</span>
                            </div>
                            <p className="text-[9px] text-[#6B6E6B] truncate">{apt.serviceName}</p>
                            <p className="text-[8px] text-[#8B8D8B] truncate">{apt.specialistName} · {apt.durationMinutes}m</p>

                            {(apt.status === 'confirmed' || apt.status === 'checked_in' || apt.status === 'in_progress') && (
                              <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => onUpdateStatus?.(apt.id, 'completed')}
                                  className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => onUpdateStatus?.(apt.id, 'cancelled')}
                                  className="text-[8px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Week View */
        <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#F0EDE8] bg-[#FDFCFB]">
            {weekDays.map((day) => (
              <div
                key={day.full}
                className={`p-3 text-center border-r border-[#F0EDE8] last:border-r-0 ${day.isToday ? 'bg-[#F5F7F4]' : ''}`}
              >
                <p className="text-[11px] font-semibold text-[#8B8D8B] uppercase">{day.day}</p>
                <p className={`text-sm font-bold mt-0.5 ${day.isToday ? 'text-[#8B9D83]' : 'text-[#1A1C1A]'}`}>
                  {day.date}
                </p>
                {day.isToday && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#8B9D83] bg-white px-2 py-0.5 rounded-full border border-[#8B9D83]/30">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[400px]">
            {weekDays.map((day) => {
              const dayApts = filteredAppointments
                .filter((apt) => apt.date === day.full)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={day.full} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#8B8D8B] pb-1 border-b border-[#F0EDE8]">
                    <span>{dayApts.length} booking{dayApts.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => onNewAppointment(undefined, undefined, day.full)}
                      className="text-[#8B9D83] hover:text-[#7A8C72]"
                      title="Add appointment"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {dayApts.length === 0 ? (
                    <p className="text-[10px] text-[#C5C2BD] py-4 text-center">No appointments</p>
                  ) : (
                    dayApts.map((apt) => renderAppointmentCard(apt, true))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
