import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  MoreHorizontal, 
  Plus, 
  ArrowUpDown, 
  Phone, 
  Mail,
  FileCheck,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { CRMAppointment, AppointmentStatus } from '../../types';
import { TEAM_MEMBERS } from '../../data/spaData';

interface AppointmentsListTabProps {
  appointments: CRMAppointment[];
  onSelectAppointment: (appointment: CRMAppointment) => void;
  onNewAppointment: () => void;
  onUpdateStatus: (appointmentId: string, newStatus: AppointmentStatus) => void;
}

export const AppointmentsListTab: React.FC<AppointmentsListTabProps> = ({
  appointments,
  onSelectAppointment,
  onNewAppointment,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [specialistFilter, setSpecialistFilter] = useState<string>('all');

  const filteredAppointments = appointments.filter(apt => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (specialistFilter !== 'all' && apt.specialistId !== specialistFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientEmail.toLowerCase().includes(q) ||
        apt.patientPhone.toLowerCase().includes(q) ||
        apt.serviceName.toLowerCase().includes(q) ||
        apt.room.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'checked_in':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'pending_payment':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'deposit_only':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div id="crm-appointments-list" className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
          <input
            type="text"
            placeholder="Search patient, phone, service, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] placeholder:text-[#8B8D8B] focus:outline-hidden focus:border-[#8B9D83]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] px-3 py-2 focus:outline-hidden focus:border-[#8B9D83]"
          >
            <option value="all">All Statuses ({appointments.length})</option>
            <option value="in_progress">In Treatment</option>
            <option value="checked_in">Checked In</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="pending_payment">Pending Payment</option>
          </select>

          {/* Specialist Filter */}
          <select
            value={specialistFilter}
            onChange={(e) => setSpecialistFilter(e.target.value)}
            className="text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] px-3 py-2 focus:outline-hidden focus:border-[#8B9D83]"
          >
            <option value="all">All Specialists</option>
            {TEAM_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* New Booking CTA */}
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white rounded-2xl border border-[#F0EDE8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0EDE8] bg-[#FDFCFB] text-[11px] font-semibold uppercase tracking-wider text-[#8B8D8B]">
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Treatment & Service</th>
                <th className="py-3.5 px-4">Specialist & Suite</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EDE8] text-xs">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((apt) => (
                  <tr 
                    key={apt.id} 
                    className="hover:bg-[#FDFCFB] transition-colors group cursor-pointer"
                    onClick={() => onSelectAppointment(apt)}
                  >
                    {/* Patient Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {apt.patientAvatar ? (
                          <img 
                            src={apt.patientAvatar} 
                            alt={apt.patientName}
                            className="w-9 h-9 rounded-full object-cover border border-[#F0EDE8]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#F5F7F4] flex items-center justify-center font-bold text-xs text-[#8B9D83]">
                            {apt.patientName.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-[#1A1C1A] group-hover:text-[#8B9D83] transition-colors">
                              {apt.patientName}
                            </span>
                            {apt.isFirstVisit && (
                              <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8B8D8B]">{apt.patientPhone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Treatment Column */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0 max-w-[200px]">
                        <p className="font-medium text-[#1A1C1A] truncate">{apt.serviceName}</p>
                        <p className="text-[11px] text-[#8B8D8B]">{apt.durationMinutes} minutes</p>
                      </div>
                    </td>

                    {/* Specialist & Room Column */}
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-[#1A1C1A]">{apt.specialistName.split(',')[0]}</p>
                        <p className="text-[11px] text-[#8B9D83] truncate">{apt.room.split('—')[0]}</p>
                      </div>
                    </td>

                    {/* Time Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-mono font-semibold text-[#1A1C1A]">{apt.startTime}</p>
                      <p className="text-[10px] text-[#8B8D8B]">{apt.date}</p>
                    </td>

                    {/* Price Column */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1C1A]">
                      ${apt.price}
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(apt.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span className="capitalize">{apt.status.replace('_', ' ')}</span>
                      </span>
                    </td>

                    {/* Payment Column */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${getPaymentBadge(apt.paymentStatus)}`}>
                        {apt.paymentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {(apt.status === 'confirmed' || apt.status === 'checked_in' || apt.status === 'in_progress') && (
                          <>
                            {apt.status === 'confirmed' && (
                              <button
                                onClick={() => onUpdateStatus(apt.id, 'completed')}
                                className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            {apt.status === 'checked_in' && (
                              <button
                                onClick={() => onUpdateStatus(apt.id, 'in_progress')}
                                className="px-2 py-1 text-[11px] font-medium bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg border border-blue-200 transition-colors"
                              >
                                Start
                              </button>
                            )}
                            {apt.status === 'in_progress' && (
                              <button
                                onClick={() => onUpdateStatus(apt.id, 'completed')}
                                className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-emerald-200 transition-colors"
                              >
                                Complete
                              </button>
                            )}
                            <button
                              onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                              className="px-2 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onSelectAppointment(apt)}
                          className="p-1.5 text-[#8B8D8B] hover:text-[#1A1C1A] rounded-lg hover:bg-[#F5F7F4]"
                          title="View Details"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#8B8D8B]">
                    No appointments found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
