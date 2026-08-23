"use client";
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { SkinMatcher } from '@/components/SkinMatcher';
import { FeaturedServices } from '@/components/FeaturedServices';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { TeamSection } from '@/components/TeamSection';
import { SanctuarySection } from '@/components/SanctuarySection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { LocationHours } from '@/components/LocationHours';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { BookingModal } from '@/components/BookingModal';
import { ServiceDetailModal } from '@/components/ServiceDetailModal';
import { Service } from '@/types';
import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, LayoutDashboard } from 'lucide-react';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | undefined>(undefined);
  const [activeDetailService, setActiveDetailService] = useState<Service | null>(null);
  const router = useRouter();

  // Open booking modal with optional pre-selected treatment or specialist
  const handleOpenBooking = (serviceId?: string, specialistId?: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSpecialistId(specialistId);
    setBookingModalOpen(true);
  };

  const handleOpenServiceDetails = (service: Service) => {
    setActiveDetailService(service);
  };

  const handleBookFromDetails = (serviceId: string) => {
    setActiveDetailService(null);
    handleOpenBooking(serviceId);
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-[#2D302E]">
      {/* Sticky Navigation Header */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking()} 
        onOpenStaffPortal={() => router.push('/dashboard')}
      />

      {/* Main Marketing Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section with strong CTA */}
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* 2. Interactive Treatment & Skin Concierge Matcher */}
        <SkinMatcher 
          onSelectTreatmentForBooking={(serviceId: string, specialistId?: string) => handleOpenBooking(serviceId, specialistId)}
          onOpenDetails={handleOpenServiceDetails}
        />

        {/* 3. Featured Services Section (HydraFacial, Peels, Lasers, etc.) */}
        <FeaturedServices 
          onSelectServiceForBooking={(serviceId: string) => handleOpenBooking(serviceId)}
          onOpenDetails={handleOpenServiceDetails}
        />

        {/* 4. Why Choose Lumina / Clinical Pillars */}
        <WhyChooseUs />

        {/* 5. Medical & Aesthetic Team (Dr. Emma, Sarah, Michael, Elena) */}
        <TeamSection 
          onBookWithSpecialist={(specialistId: string) => handleOpenBooking(undefined, specialistId)}
        />

        {/* 6. Sanctuary Atmosphere & Private Suites */}
        <SanctuarySection />

        {/* 7. Patient Reviews & Testimonials */}
        <ReviewsSection />

        {/* 8. Sanctuary Location, Hours & Valet */}
        <LocationHours onOpenBooking={() => handleOpenBooking()} />

        {/* 9. FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onOpenBooking={() => handleOpenBooking()} />

      {/* Floating Staff Portal Quick Toggle Pill (Desktop/Tablet) */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:block">
        <button
          id="floating-staff-crm-quick-toggle"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#1A1C1A] text-white text-xs font-semibold shadow-xl hover:bg-black border border-[#2D302E] transition-all hover:scale-105 group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <LayoutDashboard className="w-4 h-4 text-[#8B9D83]" />
          <span>Staff Portal & CRM</span>
        </button>
      </div>

      {/* Floating Mobile Booking Pill */}
      <div className="sm:hidden fixed bottom-5 inset-x-4 z-30 flex gap-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="p-3.5 rounded-full bg-[#1A1C1A] text-[#8B9D83] shadow-xl border border-[#2D302E]"
          title="Staff Portal"
        >
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <button
          id="floating-mobile-book-btn"
          onClick={() => handleOpenBooking()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-[#8B9D83] text-white font-semibold text-sm shadow-xl hover:bg-[#7A8C72] active:scale-98 transition-all"
        >
          <Calendar className="w-4 h-4 text-white" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Interactive Booking Flow Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialServiceId={selectedServiceId}
        initialSpecialistId={selectedSpecialistId}
      />

      {/* Service Detail Drawer / Modal */}
      <ServiceDetailModal
        service={activeDetailService}
        onClose={() => setActiveDetailService(null)}
        onBookService={handleBookFromDetails}
      />
    </div>
  );
}

