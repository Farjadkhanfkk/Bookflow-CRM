import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Sparkles,
  Send,
  Printer
} from 'lucide-react';
import { CRMAppointment, AppointmentStatus } from '../../types';

interface AppointmentDetailDrawerProps {
  appointment: CRMAppointment | null;
  onClose: () => void;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => void;
  onUpdateNotes: (appointmentId: string, notes: string) => void;
}

export const AppointmentDetailDrawer: React.FC<AppointmentDetailDrawerProps> = ({
  appointment,
  onClose,
  onUpdateStatus,
  onUpdateNotes
}) => {
  if (!appointment) return null;

  const [notes, setNotes] = useState<string>(appointment.notes || '');
  const [savedNotes, setSavedNotes] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(appointment.id, notes);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 2000);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'checked_in':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-[#F5F7F4] text-[#2D302E] border-[#8B9D83]/40';
      case 'completed':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'pending_payment':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FDFCFB] h-full shadow-2xl border-l border-[#F0EDE8] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="sticky top-0 bg-[#FDFCFB]/95 backdrop-blur-md px-6 py-4 border-b border-[#F0EDE8] flex items-center justify-between z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B9D83] font-mono block">
              Appointment #{appointment.id}
            </span>
            <h2 className="text-base font-semibold text-[#1A1C1A]">Clinical Session Details</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F5F7F4] border border-[#F0EDE8] text-[#6B6E6B] hover:text-[#1A1C1A] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          
          {/* Patient Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-3">
            <div className="flex items-center gap-3.5">
              {appointment.patientAvatar ? (
                <img 
                  src={appointment.patientAvatar} 
                  alt={appointment.patientName}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#8B9D83]/40"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#F5F7F4] flex items-center justify-center text-[#8B9D83] font-bold text-sm">
                  {appointment.patientName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#1A1C1A]">{appointment.patientName}</h3>
                  {appointment.isFirstVisit && (
                    <span className="text-[9px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                      First Visit
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B6E6B] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-[#8B9D83]" />
                  <span>{appointment.patientPhone}</span>
                </p>
                <p className="text-[11px] text-[#6B6E6B] flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#8B9D83]" />
                  <span className="truncate">{appointment.patientEmail}</span>
                </p>
              </div>
            </div>

            {/* Medical Sensitivities Alert */}
            {appointment.medicalAlerts && appointment.medicalAlerts.length > 0 && appointment.medicalAlerts[0] !== 'None' && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2 text-[11px]">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Medical Alert / Skin Sensitivity:</strong>
                  <span>{appointment.medicalAlerts.join(', ')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Treatment & Time Details Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F5F7F4]">
              <span className="font-semibold text-[#1A1C1A]">Treatment Information</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(appointment.status)}`}>
                {appointment.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Service:</span>
                <strong className="text-[#1A1C1A]">{appointment.serviceName}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Practitioner:</span>
                <span className="text-[#1A1C1A] font-medium">{appointment.specialistName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Scheduled Slot:</span>
                <span className="font-mono font-semibold text-[#1A1C1A]">{appointment.date} @ {appointment.startTime} – {appointment.endTime}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Duration:</span>
                <span className="text-[#1A1C1A]">{appointment.durationMinutes} minutes</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Sanctuary Suite:</span>
                <span className="text-[#8B9D83] font-medium">{appointment.room}</span>
              </div>
            </div>
          </div>

          {/* Status Change Control Buttons */}
          <div className="space-y-2">
            <span className="font-semibold uppercase tracking-wider text-[#8B8D8B] text-[10px] block">
              Update Appointment Status
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                  appointment.status === 'confirmed'
                    ? 'bg-[#8B9D83] text-white border-[#8B9D83] font-semibold'
                    : 'bg-white border-[#F0EDE8] text-[#2D302E] hover:bg-[#F5F7F4]'
                }`}
              >
                Confirmed
              </button>

              <button
                onClick={() => onUpdateStatus(appointment.id, 'checked_in')}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                  appointment.status === 'checked_in'
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                    : 'bg-white border-[#F0EDE8] text-[#2D302E] hover:bg-[#F5F7F4]'
                }`}
              >
                Checked In
              </button>

              <button
                onClick={() => onUpdateStatus(appointment.id, 'in_progress')}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                  appointment.status === 'in_progress'
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-white border-[#F0EDE8] text-[#2D302E] hover:bg-[#F5F7F4]'
                }`}
              >
                In Treatment
              </button>

              <button
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                  appointment.status === 'completed'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                    : 'bg-white border-[#F0EDE8] text-[#2D302E] hover:bg-[#F5F7F4]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Clinical & Practitioner Notes Textarea */}
          <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1C1A] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8B9D83]" />
                <span>Clinical Notes & Chart Observations</span>
              </span>
              {savedNotes && (
                <span className="text-[10px] text-emerald-600 font-semibold">Notes Saved ✓</span>
              )}
            </div>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter treatment parameters, serum formulas used, laser fluence settings, or post-care recommendations..."
              className="w-full p-3 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-[#FDFCFB] focus:outline-hidden focus:border-[#8B9D83]"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="px-3.5 py-1.5 rounded-lg bg-[#2D302E] text-white hover:bg-black text-[11px] font-medium transition-colors"
              >
                Save Clinical Notes
              </button>
            </div>
          </div>

          {/* Billing & Settlement Section */}
          <div className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#F5F7F4]">
              <span className="font-semibold text-[#1A1C1A] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#8B9D83]" />
                <span>Payment & Checkout Terminal</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {appointment.paymentStatus === 'paid' ? 'Settled in Full' : 'Due at Terminal'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Service Price:</span>
                <span className="font-mono text-[#1A1C1A]">${appointment.price}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B8D8B]">Online Deposit Applied:</span>
                <span className="font-mono text-emerald-700">-$50.00</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#F5F7F4] text-sm font-bold">
                <span className="text-[#1A1C1A]">Balance Due:</span>
                <span className="font-mono text-[#1A1C1A]">
                  ${appointment.paymentStatus === 'paid' ? '0.00' : `${appointment.price - 50}.00`}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Bottom Actions */}
        <div className="sticky bottom-0 bg-[#FDFCFB] px-6 py-4 border-t border-[#F0EDE8] flex items-center justify-between gap-3">
          <button
            onClick={() => alert(`Pre-treatment preparation SMS resent to ${appointment.patientPhone}`)}
            className="px-3.5 py-2 rounded-xl border border-[#F0EDE8] bg-white text-xs font-medium text-[#2D302E] hover:bg-[#F5F7F4] flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#8B9D83]" />
            <span>Resend SMS</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#1A1C1A] text-white text-xs font-semibold hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
