import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Calendar, Menu, X, Clock, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { SPA_INFO } from '../data/spaData';

interface NavbarProps {
  onOpenBooking: (serviceId?: string, specialistId?: string) => void;
  onOpenStaffPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenStaffPortal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Featured Treatments', href: '#services' },
    { name: 'Skin Matcher', href: '#treatment-matcher' },
    { name: 'Why Lumina', href: '#why-us' },
    { name: 'Medical Team', href: '#team' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Sanctuary & Hours', href: '#location' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      {/* Top Banner Announcement */}
      <div id="top-announcement" className="bg-[#1A1C1A] text-[#FDFCFB] text-xs py-2.5 px-4 border-b border-[#2D302E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center justify-center p-1 rounded-full bg-[#8B9D83]/25 text-[#8B9D83]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span>
              <strong className="text-[#8B9D83]">Spring Radiance Event:</strong> Complimentary Skin Analysis & LED Booster with any HydraFacial or Peel.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#A5A29D] text-xs">
            {onOpenStaffPortal && (
              <button
                id="header-staff-portal-btn"
                onClick={onOpenStaffPortal}
                className="inline-flex items-center gap-1.5 text-xs text-[#8B9D83] hover:text-white bg-[#232624] hover:bg-[#2D302E] px-2.5 py-1 rounded-full border border-[#8B9D83]/30 transition-colors font-medium cursor-pointer"
              >
                <LayoutDashboard className="w-3 h-3 text-[#8B9D83]" />
                <span>Staff Portal (CRM)</span>
              </button>
            )}
            <a 
              href={`tel:${SPA_INFO.formattedPhone}`} 
              className="hidden sm:flex items-center gap-1.5 hover:text-[#8B9D83] transition-colors"
              id="header-phone-link"
            >
              <Phone className="w-3 h-3 text-[#8B9D83]" />
              <span>{SPA_INFO.phone}</span>
            </a>
            <span className="hidden md:inline-block text-[#6B6E6B]">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[#A5A29D]">
              <ShieldCheck className="w-3 h-3 text-[#8B9D83]" />
              Physician-Led Clinic
            </span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header 
        id="main-navigation"
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-xs border-b border-[#F0EDE8] py-3.5' 
            : 'bg-white/50 backdrop-blur-sm py-4 border-b border-[#F0EDE8]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="group flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8B9D83] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold tracking-tight serif text-[#1A1C1A]">
                  Lumina Med Spa
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest text-[#8B9D83] bg-[#F5F7F4] px-1.5 py-0.5 rounded-full border border-[#F0EDE8]">
                  BookFlow
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-widest font-medium text-[#6B6E6B] hover:text-[#8B9D83] transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action: Staff Portal & CTA & Mobile Trigger */}
          <div className="flex items-center gap-2.5">
            {onOpenStaffPortal && (
              <button
                id="nav-staff-dashboard-btn"
                onClick={onOpenStaffPortal}
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#F0EDE8] bg-[#FDFCFB] hover:bg-[#F5F7F4] text-xs font-medium text-[#2D302E] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#8B9D83]" />
                <span>Staff CRM</span>
              </button>
            )}

            <button
              id="nav-book-btn"
              onClick={() => onOpenBooking()}
              className="hidden sm:inline-flex items-center gap-2 bg-[#8B9D83] text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#7A8C72] transition-all shadow-sm active:scale-98 group"
            >
              <Calendar className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile menu button */}
            <button
              id="mobile-menu-toggle"
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#2D302E] hover:bg-[#F5F7F4] border border-[#F0EDE8] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu-drawer" className="lg:hidden bg-white border-b border-[#F0EDE8] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#2D302E] hover:bg-[#F5F7F4] hover:text-[#8B9D83] transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-[#F0EDE8] space-y-2">
              {onOpenStaffPortal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStaffPortal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1C1A] text-[#8B9D83] text-xs font-semibold hover:bg-black"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Open Staff Dashboard & CRM</span>
                </button>
              )}

              <button
                id="mobile-menu-book-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#8B9D83] text-white text-sm font-medium shadow-sm hover:bg-[#7A8C72]"
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>Book Appointment</span>
              </button>
              
              <a
                href={`tel:${SPA_INFO.formattedPhone}`}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-[#F0EDE8] text-[#2D302E] text-xs font-medium hover:bg-[#F5F7F4]"
              >
                <Phone className="w-3.5 h-3.5 text-[#8B9D83]" />
                <span>Call Concierge: {SPA_INFO.phone}</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

