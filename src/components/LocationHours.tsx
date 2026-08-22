import React from 'react';
import { MapPin, Clock, Phone, Mail, Car, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';
import { SPA_INFO } from '../data/spaData';

interface LocationHoursProps {
  onOpenBooking: () => void;
}

export const LocationHours: React.FC<LocationHoursProps> = ({ onOpenBooking }) => {
  return (
    <section id="location" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Address, Hours, and Contact Cards */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
                <MapPin className="w-3.5 h-3.5" />
                Sanctuary Location & Hours
              </div>

              <h2 className="text-3xl sm:text-4xl font-light serif text-[#1A1C1A]">
                Visit Our Beverly Hills Sanctuary
              </h2>

              <p className="text-base text-[#6B6E6B] leading-relaxed">
                Conveniently situated in the golden triangle with private underground valet parking and dedicated elevator access directly to our 3rd-floor clinical suite.
              </p>
            </div>

            {/* Hours & Address Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#F5F7F4] text-[#8B9D83] flex items-center justify-center shrink-0 mt-0.5 border border-[#F0EDE8]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1A1C1A]">Clinic Address</h4>
                  <p className="text-xs sm:text-sm text-[#6B6E6B] mt-0.5">{SPA_INFO.address}</p>
                  <p className="text-xs text-[#8B9D83] font-medium mt-1 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" /> Complimentary Valet Available
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5 pt-4 border-t border-[#F0EDE8]">
                <div className="w-10 h-10 rounded-lg bg-[#F5F7F4] text-[#8B9D83] flex items-center justify-center shrink-0 mt-0.5 border border-[#F0EDE8]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#1A1C1A]">Operating Hours</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F7F4] text-[#8B9D83] border border-[#F0EDE8]">
                      Open Today
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs sm:text-sm text-[#6B6E6B]">
                    {SPA_INFO.hours.map((item, idx) => (
                      <div key={idx} className="flex justify-between border-b border-[#F9F8F6] pb-1 last:border-0">
                        <span className="font-medium text-[#2D302E]">{item.days}</span>
                        <span className="text-[#1A1C1A]">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone & Direct Concierge */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#F0EDE8] text-xs">
                <a
                  href={`tel:${SPA_INFO.formattedPhone}`}
                  className="flex items-center gap-2 font-semibold text-[#1A1C1A] hover:text-[#8B9D83] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#8B9D83]" />
                  <span>{SPA_INFO.phone}</span>
                </a>
                <a
                  href={`mailto:${SPA_INFO.email}`}
                  className="flex items-center gap-2 text-[#6B6E6B] hover:text-[#1A1C1A] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#8B9D83]" />
                  <span>{SPA_INFO.email}</span>
                </a>
              </div>

            </div>

            {/* Quick Action Button */}
            <button
              onClick={onOpenBooking}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-[#8B9D83]" />
              <span>Schedule Your Visit via BookFlow</span>
              <ArrowRight className="w-4 h-4 text-[#A5A29D]" />
            </button>
          </div>

          {/* Right Column: Visual Aesthetic Map Representation */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#F0EDE8] relative min-h-[360px] bg-stone-200 shadow-sm flex flex-col justify-end">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
              alt="Beverly Hills Location Map Map view"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1A]/95 via-[#1A1C1A]/40 to-transparent" />

            {/* Floating Location Card */}
            <div className="relative p-6 sm:p-8 text-white space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B9D83] text-white text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                Lumina Medical Spa & Wellness
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-white">
                428 Beverly Hills Boulevard
              </h3>
              <p className="text-xs sm:text-sm text-[#E5E2DD] max-w-md">
                Enter through the private courtyard on Linden Drive. Check-in directly at Suite 300 where our concierge will greet you with your chosen botanical elixir.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
