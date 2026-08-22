'use client';

import React from 'react';
import { X, Phone, Mail, Calendar, DollarSign, Sparkles, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CustomerDirectoryEntry } from '@/types';

interface CustomerDetailModalProps {
  customer: CustomerDirectoryEntry | null;
  onClose: () => void;
  onNewBooking?: (customer: CustomerDirectoryEntry) => void;
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '—'
  );
}

function getTierBadge(tier: string) {
  switch (tier) {
    case 'Founder Circle':
      return 'bg-[#1A1C1A] text-white border border-[#3D403D]';
    case 'Privilege VIP':
      return 'bg-[#F5F7F4] text-[#8B9D83] font-semibold border border-[#8B9D83]/30';
    case 'Standard':
    default:
      return 'bg-stone-50 text-stone-700 border border-stone-200';
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return { bg: 'bg-stone-100 text-stone-600 border-stone-200', label: 'Completed' };
    case 'in_progress':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'In Treatment' };
    case 'confirmed':
      return { bg: 'bg-[#F5F7F4] text-[#2D302E] border-[#8B9D83]/30', label: 'Scheduled' };
    case 'checked_in':
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Checked In' };
    case 'cancelled':
      return { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' };
    case 'pending_payment':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Pending Payment' };
    default:
      return { bg: 'bg-stone-50 text-stone-600 border-stone-200', label: status };
  }
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  onNewBooking,
}) => {
  if (!customer) return null;

  const totalSpend =
    customer.appointmentHistory
      .filter((item) => item.status === 'completed')
      .reduce((sum, item) => sum + item.servicePrice, 0) || customer.totalSpend;
  const completedTreatments = customer.appointmentHistory.filter(
    (item) => item.status === 'completed'
  ).length;
  const totalBookings = customer.appointmentHistory.length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full border border-[#F0EDE8] shadow-2xl animate-in zoom-in-95 my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#F0EDE8] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-[#1A1C1A] text-[#8B9D83] flex items-center justify-center text-lg font-bold font-serif border border-[#2D302E] shrink-0">
              {getInitials(customer.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-[#1A1C1A] truncate">{customer.name}</h3>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTierBadge(customer.membershipTier)}`}
                >
                  {customer.membershipTier}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B6E6B]">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#8B9D83]" />
                  {customer.email || '—'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#8B9D83]" />
                  {customer.phone || '—'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#8B9D83]" />
                  {customer.joinDate ? `Member since ${customer.joinDate}` : 'Patient on record'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close customer detail"
            className="w-8 h-8 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-[#6B6E6B] flex items-center justify-center shrink-0 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
{/* Summary Stats */}
        <div className="px-6 py-5 border-b border-[#F0EDE8] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8B8D8B]">
              <DollarSign className="w-3 h-3 text-[#8B9D83]" />
              Lifetime Spend
            </div>
            <p className="mt-1 font-mono font-bold text-[#1A1C1A]">
              ${totalSpend.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8B8D8B]">
              <CheckCircle2 className="w-3 h-3 text-[#8B9D83]" />
              Completed
            </div>
            <p className="mt-1 font-mono font-bold text-[#1A1C1A]">
              {completedTreatments}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8B8D8B]">
              <Calendar className="w-3 h-3 text-[#8B9D83]" />
              Total Bookings
            </div>
            <p className="mt-1 font-mono font-bold text-[#1A1C1A]">
              {totalBookings}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#FDFCFB] border border-[#F0EDE8]">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8B8D8B]">
              <Sparkles className="w-3 h-3 text-[#8B9D83]" />
              Last Visit
            </div>
            <p className="mt-1 font-mono font-bold text-[#1A1C1A]">{customer.lastVisit}</p>
          </div>
        </div>
{/* Complete Appointment History */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[#1A1C1A]">
              Complete Appointment History
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] border border-[#F0EDE8]">
              {customer.appointmentHistory.length} total
            </span>
          </div>

          {customer.appointmentHistory.length > 0 ? (
            <div className="max-h-[340px] overflow-y-auto divide-y divide-[#F9F8F6] rounded-2xl border border-[#F0EDE8]">
              {customer.appointmentHistory.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-4">
                    {/* Date/Time */}
                    <div className="w-20 shrink-0">
                      <span className="block text-[11px] font-bold text-[#1A1C1C]">
                        {item.date || '—'}
                      </span>
                      <span className="block text-[10px] text-[#8B8D8B]">{item.time}</span>
                    </div>

                    {/* Service */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#1A1C1C] truncate">
                        {item.serviceName}
                      </p>
                      <p className="text-[11px] text-[#6B6E6B] truncate">
                        {item.specialistName}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="w-16 text-right shrink-0">
                      <span className="font-mono font-bold text-[#1A1C1C]">
                        ${item.servicePrice.toLocaleString()}
                      </span>
                    </div>

                    {/* Status */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 rounded-2xl bg-[#FDFCFB] border border-[#F0EDE8]">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5F7F4] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#8B9D83]" />
              </div>
              <p className="mt-3 text-sm text-[#8B8D8B]">No appointments on record yet.</p>
            </div>
          )}

          {/* Notes */}
          {customer.notes ? (
            <div className="mt-4 p-3.5 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#8B8D8B]">
                Clinical & Aesthetic Notes
              </span>
              <p className="mt-1 text-xs text-[#2D302E] leading-relaxed">{customer.notes}</p>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#F0EDE8] flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-xs font-medium text-[#2D302E] border border-[#F0EDE8] transition-colors"
          >
            Close
          </button>
          {onNewBooking && (
            <button
              onClick={() => onNewBooking(customer)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#8B9D83] text-white text-xs font-semibold hover:bg-[#7A8C72] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Book New Treatment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};