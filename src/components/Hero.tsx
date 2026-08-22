import React from 'react';
import { Calendar, ShieldCheck, Sparkles, Star, Clock, CheckCircle2, ArrowRight, UserCheck, Heart } from 'lucide-react';
import { SPA_INFO } from '../data/spaData';

interface HeroProps {
  onOpenBooking: (serviceId?: string, specialistId?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-br from-white to-[#F9F8F6] border-b border-[#F0EDE8]">
      {/* Subtle organic background glow accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#F5F7F4] via-[#F0EDE8]/40 to-transparent pointer-events-none rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & High-Impact CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Eyebrow / Trust Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F0EDE8] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#8B9D83] animate-pulse"></span>
              <span className="text-[#8B9D83] font-semibold uppercase tracking-[0.25em] text-[11px]">
                Advanced Aesthetic Care
              </span>
              <span className="text-[#8B8D8B] text-xs">•</span>
              <span className="text-xs font-medium text-[#6B6E6B]">
                4.98 ★ (850+ Reviews)
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.12] serif text-[#1A1C1A]">
                Reveal Your Most <br className="hidden sm:inline" />
                <span className="italic font-normal text-[#8B9D83]">
                  Radiant
                </span> Self.
              </h1>

              <p className="text-base sm:text-lg text-[#6B6E6B] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Lumina Med Spa combines medical precision with a holistic approach to beauty, powered by BookFlow CRM for a seamless consultation and treatment experience.
              </p>
            </div>

            {/* High-Impact CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-book-appointment-btn"
                onClick={() => onOpenBooking()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black active:scale-98 transition-all shadow-sm group"
              >
                <Calendar className="w-4 h-4 text-[#8B9D83] group-hover:scale-110 transition-transform" />
                <span>Book Appointment</span>
                <ArrowRight className="w-4 h-4 text-[#8B8D8B] group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="#services"
                id="hero-explore-services-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-[#2D302E] text-[#2D302E] text-sm font-medium hover:bg-[#2D302E]/5 active:scale-98 transition-all"
              >
                <span>View Treatments</span>
              </a>
            </div>

            {/* Client Social Proof Badge Row */}
            <div className="pt-6 border-t border-[#F0EDE8] flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-2.5">
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#E5E2DD] flex items-center justify-center text-[10px] font-semibold text-[#2D302E]">JD</div>
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#D5D2CD] flex items-center justify-center text-[10px] font-semibold text-[#2D302E]">MK</div>
                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#C5C2BD] flex items-center justify-center text-[10px] font-semibold text-[#2D302E]">LS</div>
              </div>
              <p className="text-xs text-[#8B8D8B]">
                Joined by <span className="text-[#2D302E] font-semibold">500+</span> happy clients this month
              </p>
            </div>

          </div>

          {/* Right Column: Imagery & Interactive Concierge Teaser */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Visual Image Card */}
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-stone-100 border border-stone-200/60">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
                  alt="Lumina Med Spa"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                />
                
                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1A]/85 via-[#1A1C1A]/25 to-transparent" />

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6 z-20 bg-stone-900/60 backdrop-blur-md p-5 rounded-2xl text-white border border-white/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B9D83] text-white text-xs font-medium uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    # SIGNATURE TREATMENT
                  </div>
                  <h2 className="text-xl font-serif font-light text-white mt-2">
                    Platinum HydraFacial® & Clinical Peels
                  </h2>
                  <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed font-light mt-1">
                    Deep lymphatic detoxification, vortex acid infusion, and collagen LED therapy with Sarah Jenkins & Dr. Emma Harrison.
                  </p>
                </div>
              </div>

              {/* Top-Left Floating Badge: Dr. Emma Harrison */}
              <div className="absolute -top-4 -left-4 sm:-left-6 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80"
                  alt="Dr. Emma Harrison"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-[#1A1C1A]">Dr. Emma Harrison, MD</span>
                  </div>
                  <p className="text-[11px] text-[#8B9D83] font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Slots Open This Week
                  </p>
                </div>
              </div>

              {/* Bottom-Right Floating Pill */}
              <div className="absolute -bottom-4 -right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5F7F4] text-[#8B9D83]">
                  <Heart className="w-5 h-5 fill-[#8B9D83]/20 text-[#8B9D83]" />
                </div>
                <div className="text-left pr-2">
                  <p className="text-xs font-semibold text-[#1A1C1A]">HydraFacial Master Tech</p>
                  <p className="text-[11px] text-[#6B6E6B]">Sarah Jenkins, LE • 99% 5★</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
