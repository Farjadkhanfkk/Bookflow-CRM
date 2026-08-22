import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  MessageSquare, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Users, 
  Save, 
  Sparkles,
  Check
} from 'lucide-react';
import { TEAM_MEMBERS, SPA_INFO } from '../../data/spaData';

export const SettingsTab: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);
  const [autoIntakeEnabled, setAutoIntakeEnabled] = useState(true);
  const [depositRequirement, setDepositRequirement] = useState(true);
  const [depositAmount, setDepositAmount] = useState('50');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div id="crm-settings-tab" className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-5 border border-[#F0EDE8] shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#1A1C1A]">BookFlow Clinic & CRM Settings</h2>
          <p className="text-xs text-[#6B6E6B]">
            Configure operational hours, automated patient SMS notifications, and practitioner booking rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B9D83] text-white text-xs font-semibold hover:bg-[#7A8C72] transition-all shadow-xs"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved Settings</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Clinic General Details & Hours */}
      <div className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0EDE8] pb-3">
          <Building2 className="w-4 h-4 text-[#8B9D83]" />
          <h3 className="text-sm font-semibold text-[#1A1C1A]">Sanctuary Clinic Profile</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Clinic Name</label>
            <input
              type="text"
              defaultValue={SPA_INFO.name}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-[#FDFCFB] focus:outline-hidden focus:border-[#8B9D83]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Concierge Direct Phone</label>
            <input
              type="text"
              defaultValue={SPA_INFO.phone}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-[#FDFCFB] focus:outline-hidden focus:border-[#8B9D83]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Physical Address</label>
            <input
              type="text"
              defaultValue={SPA_INFO.address}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-[#FDFCFB] focus:outline-hidden focus:border-[#8B9D83]"
            />
          </div>
        </div>
      </div>

      {/* 2. Automated Patient Notifications (BookFlow Engine) */}
      <div className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0EDE8] pb-3">
          <MessageSquare className="w-4 h-4 text-[#8B9D83]" />
          <h3 className="text-sm font-semibold text-[#1A1C1A]">Automated SMS & Digital Intake Protocol</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] cursor-pointer hover:border-[#8B9D83]">
            <div>
              <p className="font-semibold text-[#1A1C1A]">24-Hour & 2-Hour Pre-Appointment SMS Reminders</p>
              <p className="text-[11px] text-[#6B6E6B]">
                Automatically dispatch SMS confirmation and pre-treatment instructions (e.g. stop Retinol 48h prior).
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoSmsEnabled}
              onChange={(e) => setAutoSmsEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#8B9D83]"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] cursor-pointer hover:border-[#8B9D83]">
            <div>
              <p className="font-semibold text-[#1A1C1A]">Automated Medical Intake & Consent Link</p>
              <p className="text-[11px] text-[#6B6E6B]">
                Send digital VISIA & allergy assessment link via SMS upon online booking confirmation.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoIntakeEnabled}
              onChange={(e) => setAutoIntakeEnabled(e.target.checked)}
              className="w-4 h-4 accent-[#8B9D83]"
            />
          </label>
        </div>
      </div>

      {/* 3. Practitioner Booking Availability */}
      <div className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F0EDE8] pb-3">
          <Users className="w-4 h-4 text-[#8B9D83]" />
          <h3 className="text-sm font-semibold text-[#1A1C1A]">Practitioner Online Booking Roster</h3>
        </div>

        <div className="divide-y divide-[#F0EDE8] text-xs">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-9 h-9 rounded-full object-cover border border-[#F0EDE8]"
                />
                <div>
                  <h4 className="font-semibold text-[#1A1C1A]">{member.name}</h4>
                  <p className="text-[11px] text-[#8B9D83]">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Accepting Online Bookings
                </span>
                <span className="text-[11px] text-[#6B6E6B]">Room 1–4</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
