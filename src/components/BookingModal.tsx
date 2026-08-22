import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, User, Sparkles, Check, CheckCircle2, 
  ArrowRight, ArrowLeft, Phone, Mail, ShieldCheck, Heart, Info, MapPin 
} from 'lucide-react';
import { SERVICES, TEAM_MEMBERS, SPA_INFO } from '../data/spaData';
import { Service, TeamMember, BookingState } from '../types';

import { supabase } from '@/lib/supabase';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  initialSpecialistId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialServiceId,
  initialSpecialistId,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || SERVICES[0].id);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>(initialSpecialistId || 'any');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Client contact state
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    skinConcerns: '',
    isFirstVisit: true,
  });

  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Reset or update selections when props change
  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
    if (initialSpecialistId) {
      setSelectedSpecialistId(initialSpecialistId);
    }
  }, [initialServiceId, initialSpecialistId]);

  // Generate mock available dates for the next 7 days
  const dateOptions = [
    { label: 'Tomorrow', dateStr: 'Wed, Aug 19', day: '19', month: 'AUG' },
    { label: 'Thursday', dateStr: 'Thu, Aug 20', day: '20', month: 'AUG' },
    { label: 'Friday', dateStr: 'Fri, Aug 21', day: '21', month: 'AUG' },
    { label: 'Saturday', dateStr: 'Sat, Aug 22', day: '22', month: 'AUG' },
    { label: 'Monday', dateStr: 'Mon, Aug 24', day: '24', month: 'AUG' },
    { label: 'Tuesday', dateStr: 'Tue, Aug 25', day: '25', month: 'AUG' },
  ];

  const timeSlots = [
    '09:30 AM', '10:45 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:15 PM', '05:30 PM'
  ];

  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) {
      setSelectedDate(dateOptions[0].dateStr);
    }
    if (!selectedTimeSlot && timeSlots.length > 0) {
      setSelectedTimeSlot(timeSlots[1]);
    }
  }, []);

  if (!isOpen) return null;

  const currentService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];
  const currentSpecialist = TEAM_MEMBERS.find((t) => t.id === selectedSpecialistId);

  const validateStep4 = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.clientName.trim()) {
      errors.clientName = 'Please enter your full name';
    }
    if (!formData.clientEmail.trim() || !formData.clientEmail.includes('@')) {
      errors.clientEmail = 'Please enter a valid email address';
    }
    if (!formData.clientPhone.trim() || formData.clientPhone.length < 7) {
      errors.clientPhone = 'Please enter a contact phone number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setLoading(true);

    try {
      // 1. Check or Insert Customer
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.clientEmail)
        .single();

      if (customerError && customerError.code !== 'PGRST116') throw customerError;

      let customerId = customer?.id;

      if (!customerId) {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([
            {
              full_name: formData.clientName,
              email: formData.clientEmail,
              phone: formData.clientPhone,
            },
          ])
          .select('id')
          .single();

        if (insertError) throw insertError;
        customerId = newCustomer.id;
      }

      // 2. Insert Appointment
      // Note: mapping 'any' to null for staff_id
      const staffId = selectedSpecialistId === 'any' ? null : selectedSpecialistId;
      
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            customer_id: customerId,
            service_id: selectedServiceId,
            staff_id: staffId,
            appointment_time: `${selectedDate} ${selectedTimeSlot}`, 
            status: 'confirmed',
          },
        ])
        .select('id')
        .single();

      if (appointmentError) throw appointmentError;

      setConfirmationCode(`LUM-${appointment.id.substring(0, 8).toUpperCase()}`);
      setStep(5);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#FDFCFB] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-[#F0EDE8] shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Modal Top Header */}
        <div className="sticky top-0 z-20 bg-[#FDFCFB]/95 backdrop-blur-md px-6 py-4 border-b border-[#F0EDE8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#2D302E] text-[#8B9D83] flex items-center justify-center font-serif text-sm">
              L
            </div>
            <div>
              <h2 id="booking-modal-title" className="text-base font-medium text-[#1A1C1A] flex items-center gap-1.5">
                <span>Book Appointment</span>
                <span className="text-[10px] font-bold tracking-wider text-[#8B9D83] bg-[#F5F7F4] border border-[#F0EDE8] px-1.5 py-0.5 rounded-md">
                  BookFlow CRM
                </span>
              </h2>
              <p className="text-[11px] text-[#6B6E6B]">
                Instant real-time confirmation • Zero booking fee
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white text-[#6B6E6B] hover:text-[#1A1C1A] hover:bg-[#F5F7F4] flex items-center justify-center border border-[#F0EDE8] transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step progress bar (if not yet confirmed) */}
        {step < 5 && (
          <div className="bg-[#F5F7F4] px-6 py-3 border-b border-[#F0EDE8] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 1 ? 'bg-[#2D302E] text-[#8B9D83]' : 'bg-[#E5E2DD] text-[#6B6E6B]'
              }`}>
                {step > 1 ? '✓' : '1'}
              </span>
              <span className={step === 1 ? 'text-[#1A1C1A] font-bold' : 'text-[#6B6E6B]'}>Treatment</span>
            </div>

            <span className="text-[#A5A29D]">→</span>

            <div className="flex items-center gap-2 font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 2 ? 'bg-[#2D302E] text-[#8B9D83]' : 'bg-[#E5E2DD] text-[#6B6E6B]'
              }`}>
                {step > 2 ? '✓' : '2'}
              </span>
              <span className={step === 2 ? 'text-[#1A1C1A] font-bold' : 'text-[#6B6E6B]'}>Specialist</span>
            </div>

            <span className="text-[#A5A29D]">→</span>

            <div className="flex items-center gap-2 font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 3 ? 'bg-[#2D302E] text-[#8B9D83]' : 'bg-[#E5E2DD] text-[#6B6E6B]'
              }`}>
                {step > 3 ? '✓' : '3'}
              </span>
              <span className={step === 3 ? 'text-[#1A1C1A] font-bold' : 'text-[#6B6E6B]'}>Time</span>
            </div>

            <span className="text-[#A5A29D]">→</span>

            <div className="flex items-center gap-2 font-medium">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step >= 4 ? 'bg-[#2D302E] text-[#8B9D83]' : 'bg-[#E5E2DD] text-[#6B6E6B]'
              }`}>
                4
              </span>
              <span className={step === 4 ? 'text-[#1A1C1A] font-bold' : 'text-[#6B6E6B]'}>Details</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex-1">
          
          {/* STEP 1: Select Treatment */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-light serif text-[#1A1C1A]">
                  Select Your Clinical Treatment
                </h3>
                <p className="text-xs text-[#6B6E6B]">
                  Choose from our curated menu of medical facials, laser treatments, and physician injectables.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {SERVICES.map((s) => {
                  const isSelected = s.id === selectedServiceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F5F7F4] border-[#8B9D83] ring-1 ring-[#8B9D83] shadow-xs'
                          : 'bg-white hover:bg-[#F9F8F6] border-[#F0EDE8]'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-[#1A1C1A]">
                            {s.name}
                          </h4>
                          <span className="text-xs font-bold text-[#8B9D83] bg-white px-2 py-0.5 rounded border border-[#F0EDE8]">
                            {s.price}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6E6B] line-clamp-2">
                          {s.tagline}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-[#2D302E] pt-1">
                          <span>⏱ {s.duration}</span>
                          <span>•</span>
                          <span>✨ Downtime: {s.downtime}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'bg-[#2D302E] text-[#8B9D83]' : 'border border-[#E5E2DD]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black transition-all"
                >
                  <span>Continue to Specialist</span>
                  <ArrowRight className="w-4 h-4 text-[#8B9D83]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Specialist */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-light serif text-[#1A1C1A]">
                  Select Your Preferred Practitioner
                </h3>
                <p className="text-xs text-[#6B6E6B]">
                  Treatment selected: <strong className="text-[#1A1C1A]">{currentService.name}</strong>
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                
                {/* Option 0: First Available Specialist */}
                <button
                  type="button"
                  onClick={() => setSelectedSpecialistId('any')}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedSpecialistId === 'any'
                      ? 'bg-[#F5F7F4] border-[#8B9D83] ring-1 ring-[#8B9D83]'
                      : 'bg-white hover:bg-[#F9F8F6] border-[#F0EDE8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2D302E] text-[#8B9D83] flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#1A1C1A]">First Available Specialist</h4>
                      <p className="text-xs text-[#6B6E6B]">Fastest booking appointment slot</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    selectedSpecialistId === 'any' ? 'bg-[#2D302E] text-[#8B9D83]' : 'border border-[#E5E2DD]'
                  }`}>
                    {selectedSpecialistId === 'any' && <Check className="w-3 h-3" />}
                  </div>
                </button>

                {/* Team Members */}
                {TEAM_MEMBERS.map((member) => {
                  const isSelected = selectedSpecialistId === member.id;
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => setSelectedSpecialistId(member.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#F5F7F4] border-[#8B9D83] ring-1 ring-[#8B9D83]'
                          : 'bg-white hover:bg-[#F9F8F6] border-[#F0EDE8]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-2xl object-cover border border-[#F0EDE8]"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm text-[#1A1C1A]">{member.name}</h4>
                            <span className="text-[10px] text-[#8B9D83] font-medium bg-[#F5F7F4] border border-[#F0EDE8] px-1.5 py-0.5 rounded">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B6E6B]">{member.credentials} • {member.experience}</p>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#2D302E] text-[#8B9D83]' : 'border border-[#E5E2DD]'
                      }`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6B6E6B] hover:text-[#1A1C1A]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Treatments
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black transition-all"
                >
                  <span>Select Date & Time</span>
                  <ArrowRight className="w-4 h-4 text-[#8B9D83]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Date & Time Slot */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-light serif text-[#1A1C1A]">
                  Choose Your Appointment Time
                </h3>
                <p className="text-xs text-[#6B6E6B]">
                  Provider: <strong className="text-[#1A1C1A]">{currentSpecialist?.name || 'First Available Specialist'}</strong>
                </p>
              </div>

              {/* Date Selector Row */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83] block">
                  Select Date
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {dateOptions.map((opt, i) => {
                    const isSelected = selectedDate === opt.dateStr;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedDate(opt.dateStr)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#2D302E] text-white border-[#2D302E] shadow-sm'
                            : 'bg-white border-[#F0EDE8] text-[#2D302E] hover:bg-[#F5F7F4]'
                        }`}
                      >
                        <span className="text-[10px] block text-[#A5A29D] uppercase font-medium">{opt.month}</span>
                        <span className="text-lg font-bold block">{opt.day}</span>
                        <span className="text-[10px] block opacity-80">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83] block">
                  Available Slots for {selectedDate}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot, i) => {
                    const isSelected = selectedTimeSlot === slot;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#8B9D83] text-white font-semibold border-[#8B9D83] shadow-xs'
                            : 'bg-white border-[#F0EDE8] text-[#1A1C1A] hover:bg-[#F5F7F4]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-[#F5F7F4] rounded-xl border border-[#F0EDE8] text-xs text-[#6B6E6B] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#8B9D83] shrink-0" />
                <span>You will receive an instant calendar invite & automated SMS pre-treatment reminder.</span>
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6B6E6B] hover:text-[#1A1C1A]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Specialists
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black transition-all"
                >
                  <span>Enter Contact Details</span>
                  <ArrowRight className="w-4 h-4 text-[#8B9D83]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Personal Details & Skin Goals */}
          {step === 4 && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-light serif text-[#1A1C1A]">
                  Patient Contact & Pre-Care Notes
                </h3>
                <p className="text-xs text-[#6B6E6B]">
                  Your appointment: <strong className="text-[#1A1C1A]">{currentService.name}</strong> on <strong className="text-[#1A1C1A]">{selectedDate} at {selectedTimeSlot}</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Sterling"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-sm text-[#1A1C1A] focus:outline-hidden focus:border-[#8B9D83] focus:ring-1 focus:ring-[#8B9D83]"
                  />
                  {formErrors.clientName && (
                    <p className="text-[11px] text-red-600 mt-1">{formErrors.clientName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jessica@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-sm text-[#1A1C1A] focus:outline-hidden focus:border-[#8B9D83] focus:ring-1 focus:ring-[#8B9D83]"
                    />
                    {formErrors.clientEmail && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.clientEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                      Mobile Phone (for SMS Reminders) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-sm text-[#1A1C1A] focus:outline-hidden focus:border-[#8B9D83] focus:ring-1 focus:ring-[#8B9D83]"
                    />
                    {formErrors.clientPhone && (
                      <p className="text-[11px] text-red-600 mt-1">{formErrors.clientPhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">
                    Skin Goals / Medical Allergies (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Sensitive skin, focusing on sun spots on cheeks..."
                    value={formData.skinConcerns}
                    onChange={(e) => setFormData({ ...formData, skinConcerns: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs sm:text-sm text-[#1A1C1A] focus:outline-hidden focus:border-[#8B9D83] focus:ring-1 focus:ring-[#8B9D83]"
                  />
                </div>

                {/* First time visitor toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formData.isFirstVisit}
                    onChange={(e) => setFormData({ ...formData, isFirstVisit: e.target.checked })}
                    className="rounded border-[#E5E2DD] text-[#2D302E] focus:ring-[#8B9D83]"
                  />
                  <span className="text-xs text-[#2D302E]">
                    This is my first visit to Lumina Med Spa (Qualifies for complimentary VISIA skin scan)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6B6E6B] hover:text-[#1A1C1A]"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Time Slots
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black shadow-xs transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-[#8B9D83]" />
                  <span>Confirm Booking via BookFlow</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Instant Booking Confirmation Screen */}
          {step === 5 && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#F5F7F4] text-[#8B9D83] border border-[#F0EDE8] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83] bg-[#F5F7F4] border border-[#F0EDE8] px-3.5 py-1 rounded-full">
                  Appointment Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-light serif text-[#1A1C1A] mt-3">
                  We Look Forward to Welcoming You
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6E6B] max-w-md mx-auto">
                  A calendar invite and pre-treatment preparation checklist have been sent to <strong>{formData.clientEmail}</strong>.
                </p>
              </div>

              {/* Booking Summary Ticket */}
              <div className="bg-[#F5F7F4] rounded-2xl p-5 border border-[#F0EDE8] text-left space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DD]">
                  <div>
                    <span className="text-[10px] text-[#6B6E6B] uppercase font-semibold">Booking Reference</span>
                    <p className="text-sm font-mono font-bold text-[#1A1C1A]">{confirmationCode}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#8B9D83] bg-white px-2 py-0.5 rounded border border-[#F0EDE8]">
                    Active & Scheduled
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#2D302E]">
                  <div className="flex justify-between">
                    <span className="text-[#6B6E6B]">Treatment:</span>
                    <strong className="text-[#1A1C1A]">{currentService.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6E6B]">Specialist:</span>
                    <strong className="text-[#1A1C1A]">{currentSpecialist?.name || 'Assigned Lead Specialist'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6E6B]">Date & Time:</span>
                    <strong className="text-[#1A1C1A]">{selectedDate} @ {selectedTimeSlot}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6E6B]">Location:</span>
                    <span className="text-[#1A1C1A] truncate max-w-[200px]">Suite 300, Beverly Hills</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black"
                >
                  Done & Return to Website
                </button>

                <a
                  href={`tel:${SPA_INFO.formattedPhone}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-[#F0EDE8] bg-white text-xs font-medium text-[#1A1C1A] hover:bg-[#F5F7F4]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#8B9D83]" />
                  <span>Call Concierge: {SPA_INFO.phone}</span>
                </a>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
