import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ClipboardList, 
  Users, 
  Settings, 
  ArrowLeft, 
  Sparkles, 
  LogOut, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type DashboardTab = 'dashboard' | 'calendar' | 'appointments' | 'customers' | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onExitToPublicSite: () => void;
  unreadCount?: number;
  todayAppointmentsCount?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  onExitToPublicSite,
  todayAppointmentsCount = 22
}) => {
  const navItems = [
    {
      id: 'dashboard' as DashboardTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined
    },
    {
      id: 'calendar' as DashboardTab,
      label: 'Calendar',
      icon: CalendarDays,
      badge: 'Today'
    },
    {
      id: 'appointments' as DashboardTab,
      label: 'Appointments',
      icon: ClipboardList,
      badge: todayAppointmentsCount.toString()
    },
    {
      id: 'customers' as DashboardTab,
      label: 'Customers',
      icon: Users,
      badge: undefined
    },
    {
      id: 'settings' as DashboardTab,
      label: 'Settings',
      icon: Settings,
      badge: undefined
    }
  ];

  return (
    <aside 
      id="crm-sidebar"
      className="w-64 bg-[#1A1C1A] text-[#FDFCFB] flex flex-col justify-between border-r border-[#2D302E] shrink-0 h-screen sticky top-0"
    >
      {/* Brand & Top Header */}
      <div>
        <div className="p-5 border-b border-[#2D302E]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#8B9D83] flex items-center justify-center shadow-xs">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-base font-medium tracking-tight text-white serif flex items-center gap-1.5">
                  <span>Lumina</span>
                  <span className="text-[10px] uppercase font-sans tracking-widest text-[#8B9D83] font-semibold bg-[#232624] px-1.5 py-0.5 rounded border border-[#8B9D83]/30">
                    CRM
                  </span>
                </h1>
                <p className="text-[11px] text-[#A5A29D] font-mono">BookFlow Staff Portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8B8D8B] mb-2">
            Main Management
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#8B9D83] text-white shadow-xs font-semibold'
                    : 'text-[#C5C2BD] hover:bg-[#232624] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8B9D83]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive 
                      ? 'bg-black/25 text-white' 
                      : 'bg-[#2D302E] text-[#8B9D83] border border-[#3D403D]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Sanctuary Status Pill */}
        <div className="mx-3 mt-2 p-3 rounded-xl bg-[#232624] border border-[#2D302E] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A5A29D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Clinic Status
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 font-mono">LIVE (88% Cap)</span>
          </div>
          <div className="w-full bg-[#1A1C1A] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#8B9D83] h-full rounded-full w-[88%]"></div>
          </div>
          <p className="text-[10px] text-[#8B8D8B]">4 of 5 Treatment Suites in Active Session</p>
        </div>
      </div>

      {/* Bottom User Info & Return to Website CTA */}
      <div className="p-3 border-t border-[#2D302E] space-y-2">
        {/* Active Staff Card */}
        <div className="p-2.5 rounded-xl bg-[#232624] border border-[#2D302E] flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
            alt="Dr. Emma Harrison"
            className="w-9 h-9 rounded-lg object-cover border border-[#8B9D83]/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-white truncate">Dr. Emma Harrison</p>
              <ShieldCheck className="w-3 h-3 text-[#8B9D83] shrink-0" />
            </div>
            <p className="text-[10px] text-[#8B9D83] truncate">Medical Director • Admin</p>
          </div>
        </div>

        {/* Back to Client Spa Site Button */}
        <button
          id="exit-crm-to-website-btn"
          onClick={onExitToPublicSite}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#1A1C1A] hover:bg-[#232624] text-[#A5A29D] hover:text-white border border-[#2D302E] text-xs font-medium transition-colors group"
        >
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5 text-[#8B9D83] group-hover:-translate-x-0.5 transition-transform" />
            <span>Public Spa Website</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        </button>
      </div>
    </aside>
  );
};
