"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { DashboardSidebar, DashboardTab } from './DashboardSidebar';
import { OverviewTab } from './OverviewTab';
import { ScheduleTab } from './ScheduleTab';
import { AppointmentsListTab } from './AppointmentsListTab';
import { SettingsTab } from './SettingsTab';
import { AppointmentDetailDrawer } from './AppointmentDetailDrawer';
import { NewAppointmentModal } from './NewAppointmentModal';
import { CustomersTab } from './CustomersTab';
import { CRMAppointment, AppointmentStatus, QuickStatMetric, CustomerDirectoryEntry } from '../../types';
import { toTimeLabel, computeEndTimeLabel } from '@/lib/appointment-data';

interface StaffDashboardProps {
  onExitToPublicSite: () => void;
  onLogout?: () => Promise<void> | void;
  userEmail?: string;
}
export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onExitToPublicSite,
  onLogout,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<CRMAppointment[]>([]);

  const [stats, setStats] = useState<QuickStatMetric[]>([]);
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let apts: CRMAppointment[] = [];
      let customerCount = 0;

      const [aptRes, custRes, servRes, staffRes] = await Promise.all([
        supabase.from('appointments').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('services').select('*'),
        supabase.from('staff_members').select('*')
      ]);

      if (aptRes.error) throw aptRes.error;
      if (custRes.error) throw custRes.error;
      if (servRes.error) throw servRes.error;
      if (staffRes.error) throw staffRes.error;

      const customerMap = new Map((custRes.data || []).map((c: any) => [c.id, c]));
      const serviceMap = new Map((servRes.data || []).map((s: any) => [s.id, s]));
      const staffMap = new Map((staffRes.data || []).map((st: any) => [st.id, st]));

      apts = (aptRes.data || []).map((apt: any) => {
        const cust = customerMap.get(apt.customer_id) || {};
        const serv = serviceMap.get(apt.service_id) || {};
        const staff = staffMap.get(apt.staff_id) || {};

        const servicePrice = serv.price;
        const numericPrice = typeof servicePrice === 'number'
          ? servicePrice
          : parseInt(String(servicePrice || '0').replace(/[^0-9]/g, ''), 10) || 0;
        const durationMinutes = apt.duration_minutes || 60;
        const startTime = toTimeLabel(apt.appointment_time);
        const aptDate = new Date(apt.appointment_time);
        const localDate = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;

        return {
          id: apt.id,
          patientId: apt.customer_id,
          patientName: cust.full_name || cust.name || 'Guest Client',
          patientEmail: cust.email || '',
          patientPhone: cust.phone || cust.phone_number || '',
          serviceId: apt.service_id,
          serviceName: serv.name || serv.service_name || serv.title || 'Custom Service',
          serviceCategory: (serv.category as CRMAppointment['serviceCategory']) || 'facials',
          specialistId: apt.staff_id,
          specialistName: staff.name || staff.full_name || 'Staff Member',
          date: localDate,
          startTime,
          endTime: computeEndTimeLabel(apt.appointment_time, durationMinutes),
          durationMinutes,
          room: 'Suite 300',
          status: (apt.status as AppointmentStatus) || 'confirmed',
          price: numericPrice,
          paymentStatus: (apt.payment_status as CRMAppointment['paymentStatus']) || 'pending',
          notes: apt.notes || undefined,
          intakeFormCompleted: false
        };
      });

      customerCount = (custRes.data || []).length;
      setAppointments(apts);

      const revenue = apts
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.price, 0);
      const pendingRevenue = apts
        .filter(a => a.paymentStatus === 'pending')
        .reduce((sum, a) => sum + a.price, 0);
      const activeSessions = apts.filter(a => a.status === 'in_progress' || a.status === 'checked_in').length;

      setStats([
        { id: 'revenue', title: 'Total Revenue', value: `$${revenue.toLocaleString()}`, change: '+12.5%', isPositive: true, subtext: 'From completed treatments', iconName: 'DollarSign' },
        { id: 'active-customers', title: 'Customers', value: customerCount.toLocaleString(), change: '+2.1%', isPositive: true, subtext: 'Registered & active', iconName: 'UserCheck' },
        { id: 'appointments-total', title: 'Appointments', value: apts.length.toLocaleString(), change: '+4.8%', isPositive: true, subtext: 'Lifetime total', iconName: 'Calendar' },
        { id: 'pending-payment', title: 'Pending Payment', value: `$${pendingRevenue.toLocaleString()}`, change: '0%', isPositive: pendingRevenue === 0, subtext: 'Open invoices', iconName: 'CreditCard' },
        { id: 'active-sessions', title: 'Active Sessions', value: activeSessions.toLocaleString(), change: '0%', isPositive: true, subtext: 'Right now', iconName: 'Activity' },
      ]);
     } catch (err: any) {
      console.error('Raw error loading dashboard data:', err);
      console.error('Error stringified:', JSON.stringify(err, Object.getOwnPropertyNames(err || {})));
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as any).message || 'We could not load your dashboard data. Please check your connection and retry.');
      } else if (err instanceof Error) {
        setError(err.message || 'We could not load your dashboard data. Please check your connection and retry.');
      } else {
        setError('We could not load your dashboard data. Please check your connection and retry.');
      }
      setAppointments([]);
      setStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel('dashboard-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Realtime Appointment Change:', payload);
          loadDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Realtime Customer Change:', payload);
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

  const [selectedAppointment, setSelectedAppointment] = useState<CRMAppointment | null>(null);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [newAppointmentInitialTime, setNewAppointmentInitialTime] = useState<string | undefined>(undefined);
  const [newAppointmentInitialSpecialistId, setNewAppointmentInitialSpecialistId] = useState<string | undefined>(undefined);
  const [newAppointmentInitialDate, setNewAppointmentInitialDate] = useState<string | undefined>(undefined);
  const [bookingForCustomer, setBookingForCustomer] = useState<CustomerDirectoryEntry | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, payment_status: newStatus === 'completed' ? 'paid' : undefined })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => prev.map(a => {
        if (a.id === appointmentId) {
          return {
            ...a,
            status: newStatus,
            paymentStatus: newStatus === 'completed' ? 'paid' : a.paymentStatus
          };
        }
        return a;
      }));

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => prev ? {
          ...prev,
          status: newStatus,
          paymentStatus: newStatus === 'completed' ? 'paid' : prev.paymentStatus
        } : null);
      }

      showToast(`Appointment status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      loadDashboardData();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Failed to update status');
    }
  };

  const handleUpdateNotes = (appointmentId: string, notes: string) => {
    setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, notes } : a));
    if (selectedAppointment && selectedAppointment.id === appointmentId) {
      setSelectedAppointment(prev => prev ? { ...prev, notes } : null);
    }
  };

  const handleAddAppointmentSuccess = () => {
    loadDashboardData();
    showToast('Appointment booked successfully!');
    setBookingForCustomer(null);
  };

  const handleOpenNewAppointment = (
    time?: string,
    specialistId?: string,
    date?: string,
    customer?: CustomerDirectoryEntry,
  ) => {
    setNewAppointmentInitialTime(time);
    setNewAppointmentInitialSpecialistId(specialistId);
    setNewAppointmentInitialDate(date);
    setBookingForCustomer(customer || null);
    setIsNewAppointmentModalOpen(true);
  };

  const handleCloseNewAppointment = () => {
    setIsNewAppointmentModalOpen(false);
    setBookingForCustomer(null);
    setNewAppointmentInitialTime(undefined);
    setNewAppointmentInitialSpecialistId(undefined);
    setNewAppointmentInitialDate(undefined);
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (err) {
      console.error('Error signing out:', err);
      showToast('Failed to sign out. Please try again.');
    }
  };

  return (
    <div id="staff-dashboard-root" className="min-h-screen bg-[#FDFCFB] text-[#2D302E] flex">
      {/* 1. Sleek Modern Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onExitToPublicSite={onExitToPublicSite}
        todayAppointmentsCount={appointments.length}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        
        {/* Top Sticky CRM Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3.5 border-b border-[#F0EDE8] flex items-center justify-between gap-4">
          
          {/* Left Breadcrumbs / Current View */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83]">
              Lumina Med Spa
            </span>
            <span className="text-[#D8CEC0] text-xs">/</span>
            <h1 className="text-sm font-bold text-[#1A1C1A] capitalize">
              {activeTab === 'dashboard' ? 'Executive Operations' : activeTab}
            </h1>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Public Site Switcher Pill */}
            <button
              onClick={onExitToPublicSite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-xs font-medium text-[#2D302E] border border-[#F0EDE8] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8B9D83]" />
              <span>Exit to Spa Website</span>
            </button>

            {/* Quick + Appointment CTA */}
            <button
              id="crm-header-new-booking-btn"
              onClick={() => handleOpenNewAppointment()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">New Appointment</span>
            </button>

            {/* Staff User Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-[#1A1C1A] text-[#8B9D83] flex items-center justify-center font-serif text-xs font-bold border border-[#8B9D83]/40"
              title={userEmail || 'Staff'}
            >
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'EH'}
            </div>

            {/* Log Out */}
            <button
              id="crm-header-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-xl text-[#8B8D8B] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-6 flex-1 min-w-0">
          {error && !loading && (
            <div className="mb-5 flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadDashboardData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-[#8B9D83] animate-spin" />
              <p className="mt-3 text-sm text-[#8B8D8B]">Loading live dashboard data...</p>
            </div>
          ) : (
            <>
          {activeTab === 'dashboard' && (
            <OverviewTab
              stats={stats}
              appointments={appointments}
              error={error}
              onRetry={loadDashboardData}
              onSelectAppointment={(apt) => setSelectedAppointment(apt)}
              onNewAppointment={() => handleOpenNewAppointment()}
              onNavigateToCalendar={() => setActiveTab('calendar')}
              onNavigateToAppointments={() => setActiveTab('appointments')}
            />
          )}

          {activeTab === 'calendar' && (
            <ScheduleTab
              appointments={appointments}
              onSelectAppointment={(apt) => setSelectedAppointment(apt)}
              onNewAppointment={handleOpenNewAppointment}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsListTab
              appointments={appointments}
              onSelectAppointment={(apt) => setSelectedAppointment(apt)}
              onNewAppointment={() => handleOpenNewAppointment()}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              onSelectPatient={() => {}}
              onNewBookingForPatient={(customer) => handleOpenNewAppointment(undefined, undefined, undefined, customer)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
            </>
          )}
        </main>
      </div>

      {/* Appointment Detail Flyout Drawer */}
      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateNotes={handleUpdateNotes}
      />

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={handleCloseNewAppointment}
        onSuccess={handleAddAppointmentSuccess}
        initialTime={newAppointmentInitialTime}
        initialSpecialistId={newAppointmentInitialSpecialistId}
        initialDate={newAppointmentInitialDate}
        initialCustomer={bookingForCustomer}
      />

      {/* Floating Notification Toast */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1C1A] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#2D302E] flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#8B9D83]" />
          <span>{notificationToast}</span>
        </div>
      )}
    </div>
  );
};
