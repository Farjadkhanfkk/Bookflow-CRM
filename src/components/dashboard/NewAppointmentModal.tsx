"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  AlertTriangle,
  Loader2,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { CustomerDirectoryEntry, Service, TeamMember, BookingCustomerOption } from '@/types';
import { supabase } from '@/lib/supabase';
import {
  fetchBookingData,
  fetchCustomersForBooking,
  findOrCreateCustomer,
  checkConflicts,
  generateTimeSlots,
  parseDurationMinutes,
} from '@/lib/appointment-data';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTime?: string;
  initialSpecialistId?: string;
  initialDate?: string;
  initialCustomer?: CustomerDirectoryEntry | null;
}

function parseToIsoDateTime(dateStr: string, timeStr: string): { iso: string; dateOnly: string; time24: string } {
  try {
    let year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();

    if (dateStr) {
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      }
    }

    let hours = 9;
    let minutes = 0;

    if (timeStr) {
      const isPM = /pm/i.test(timeStr);
      const isAM = /am/i.test(timeStr);
      const cleanTime = timeStr.replace(/am|pm/i, '').trim();
      const [hStr, mStr] = cleanTime.split(':');

      hours = parseInt(hStr || '9', 10);
      minutes = parseInt(mStr || '0', 10);

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateOnly = `${year}-${pad(month)}-${pad(day)}`;
    const time24 = `${pad(hours)}:${pad(minutes)}:00`;
    const validDate = new Date(`${dateOnly}T${time24}`);

    return {
      iso: isNaN(validDate.getTime()) ? new Date().toISOString() : validDate.toISOString(),
      dateOnly,
      time24
    };
  } catch {
    return {
      iso: new Date().toISOString(),
      dateOnly: new Date().toISOString().split('T')[0],
      time24: '09:00:00'
    };
  }
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTime,
  initialSpecialistId,
  initialDate,
  initialCustomer,
}) => {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [customers, setCustomers] = useState<BookingCustomerOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [notes, setNotes] = useState('');

  const timeSlots = useMemo(() => generateTimeSlots(appointmentDate, 30), [appointmentDate]);

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const durationMinutes = selectedService
    ? parseDurationMinutes(selectedService.duration)
    : 60;

  const resetForm = useCallback(() => {
    setCustomerMode(initialCustomer ? 'existing' : 'existing');
    setCustomerSearch('');
    setSelectedCustomerId(initialCustomer?.id || '');
    setPatientName(initialCustomer?.name || '');
    setPatientPhone(initialCustomer?.phone || '');
    setPatientEmail(initialCustomer?.email || '');
    setSelectedServiceId('');
    setSelectedStaffId(initialSpecialistId || '');
    setAppointmentDate(initialDate || todayStr);
    setTimeSlot(initialTime || '10:00 AM');
    setNotes('');
    setError(null);
    setConflictWarning(null);
  }, [initialCustomer, initialSpecialistId, initialDate, initialTime, todayStr]);

  useEffect(() => {
    if (!isOpen) return;

    resetForm();
    setLoadingData(true);

    Promise.all([fetchBookingData(), fetchCustomersForBooking()])
      .then(([booking, custList]) => {
        setServices(booking.services);
        setStaff(booking.staff);
        setCustomers(custList);

        if (booking.services.length > 0 && !selectedServiceId) {
          setSelectedServiceId(booking.services[0].id);
        }
        if (booking.staff.length > 0 && !initialSpecialistId) {
          setSelectedStaffId(booking.staff[0].id);
        } else if (initialSpecialistId) {
          setSelectedStaffId(initialSpecialistId);
        }
        if (initialCustomer) {
          setSelectedCustomerId(initialCustomer.id);
          setPatientName(initialCustomer.name);
          setPatientPhone(initialCustomer.phone);
          setPatientEmail(initialCustomer.email);
        }
        if (initialTime) setTimeSlot(initialTime);
        if (initialDate) setAppointmentDate(initialDate);
      })
      .catch((err) => {
        console.error('Failed to load booking data:', err);
        setError('Could not load services and staff. Please close and try again.');
      })
      .finally(() => setLoadingData(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !selectedStaffId || !appointmentDate || !timeSlot) {
      setConflictWarning(null);
      return;
    }

    const { iso } = parseToIsoDateTime(appointmentDate, timeSlot);
    let cancelled = false;

    checkConflicts(selectedStaffId, iso, durationMinutes)
      .then((conflicts) => {
        if (cancelled) return;
        if (conflicts.length > 0) {
          const staffName = staff.find((s) => s.id === selectedStaffId)?.name || 'This specialist';
          setConflictWarning(
            `${staffName} already has ${conflicts.length} overlapping appointment(s) at ${conflicts.join(', ')}. Please choose a different time or specialist.`,
          );
        } else {
          setConflictWarning(null);
        }
      })
      .catch(() => setConflictWarning(null));

    return () => { cancelled = true; };
  }, [isOpen, selectedStaffId, appointmentDate, timeSlot, durationMinutes, staff]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customers, customerSearch]);

  const handleSelectCustomer = (customer: BookingCustomerOption) => {
    setSelectedCustomerId(customer.id);
    setPatientName(customer.name);
    setPatientEmail(customer.email);
    setPatientPhone(customer.phone);
    setCustomerSearch(customer.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (customerMode === 'existing' && !selectedCustomerId) {
      setError('Please select an existing customer or switch to "New Customer".');
      return;
    }
    if (customerMode === 'new' && !patientName.trim()) {
      setError('Please enter the customer\'s full name.');
      return;
    }
    if (!selectedServiceId || !selectedStaffId) {
      setError('Please select a service and staff member.');
      return;
    }

    setSubmitting(true);

    try {
      let customerId = selectedCustomerId;

      if (customerMode === 'new') {
        customerId = await findOrCreateCustomer({
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
        });
      }

      const { iso, dateOnly, time24 } = parseToIsoDateTime(appointmentDate, timeSlot);

      const conflicts = await checkConflicts(selectedStaffId, iso, durationMinutes);
      if (conflicts.length > 0) {
        setError('Double-booking detected. Please adjust the time or specialist before confirming.');
        setSubmitting(false);
        return;
      }

      const resolvedCustomerId = customerId || selectedCustomerId;

      const payload: Record<string, any> = {
        customer_id: resolvedCustomerId,
        service_id: selectedServiceId || null,
        staff_id: selectedStaffId || null,
        appointment_date: dateOnly,
        appointment_time: iso,
        date: dateOnly,
        time: time24,
        start_time: time24,
        duration_minutes: durationMinutes || 60,
        status: 'confirmed',
        payment_status: 'paid',
        notes: notes?.trim() || null
      };

      const { error: insertError } = await supabase
        .from('appointments')
        .insert([payload]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Detailed Booking Error:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        raw: err
      });
      const errorMsg = err?.message || err?.details || (typeof err === 'string' ? err : 'Failed to save appointment. Please check console for details.');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FDFCFB] rounded-3xl max-w-lg w-full border border-[#F0EDE8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#F0EDE8] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B9D83] text-white flex items-center justify-center font-bold text-xs">
              +
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1A1C1A]">Schedule New Appointment</h2>
              <p className="text-[11px] text-[#6B6E6B]">Staff Booking • BookFlow CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-[#6B6E6B] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#8B9D83] animate-spin" />
            <p className="mt-2 text-xs text-[#8B8D8B]">Loading booking options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {conflictWarning && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            {/* Customer selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1A1C1A] uppercase tracking-wider text-[10px]">
                  Customer
                </h3>
                <div className="flex items-center bg-[#F5F7F4] p-0.5 rounded-lg border border-[#F0EDE8]">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
                      customerMode === 'existing'
                        ? 'bg-white text-[#1A1C1A] shadow-2xs'
                        : 'text-[#6B6E6B]'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode('new')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
                      customerMode === 'new'
                        ? 'bg-white text-[#1A1C1A] shadow-2xs'
                        : 'text-[#6B6E6B]'
                    }`}
                  >
                    <UserPlus className="w-3 h-3" />
                    New
                  </button>
                </div>
              </div>

              {customerMode === 'existing' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                    />
                  </div>
                  {customerSearch && filteredCustomers.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded-xl border border-[#F0EDE8] bg-white divide-y divide-[#F0EDE8]">
                      {filteredCustomers.slice(0, 8).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className={`w-full text-left px-3 py-2 hover:bg-[#F5F7F4] transition-colors ${
                            selectedCustomerId === c.id ? 'bg-[#F5F7F4]' : ''
                          }`}
                        >
                          <p className="font-semibold text-[#1A1C1A]">{c.name}</p>
                          <p className="text-[10px] text-[#8B8D8B]">{c.email} · {c.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedCustomerId && patientName && (
                    <p className="text-[10px] text-[#8B9D83] font-medium">
                      Selected: {patientName}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Full name *"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Service & Staff */}
            <div className="space-y-3 pt-3 border-t border-[#F0EDE8]">
              <h3 className="font-semibold text-[#1A1C1A] uppercase tracking-wider text-[10px]">
                Treatment & Staff
              </h3>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.price} · {s.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Staff Member</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                >
                  {staff.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-3 pt-3 border-t border-[#F0EDE8]">
              <h3 className="font-semibold text-[#1A1C1A] uppercase tracking-wider text-[10px]">
                Date & Time
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                    Start Time ({durationMinutes} min)
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                Internal Staff Notes (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Pre-care instructions, skin goals, numbing requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83] resize-none"
              />
            </div>

            <div className="pt-4 border-t border-[#F0EDE8] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-full border border-[#F0EDE8] text-xs font-semibold text-[#6B6E6B] hover:bg-[#F5F7F4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !!conflictWarning}
                className="px-6 py-2 rounded-full bg-[#8B9D83] text-white text-xs font-semibold hover:bg-[#7A8C72] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm & Book
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
