import React from 'react';
import { Shield, Sparkles, HeartHandshake, Smartphone, Award, Stethoscope, Star, CheckCircle2 } from 'lucide-react';
import { SPA_INFO } from '../data/spaData';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: Stethoscope,
      title: "Physician-Directed Excellence",
      description: "Unlike high-turnover day spas, all treatment formulas and protocols are engineered and personally supervised by board-certified dermatologist Dr. Emma Harrison.",
      tag: "Stanford & Harvard Trained"
    },
    {
      icon: Sparkles,
      title: "Gold-Standard Technologies",
      description: "We invest exclusively in authentic, FDA-cleared devices—including original HydraFacial® MD, Morpheus8 RF, and Clear + Brilliant® fractional lasers.",
      tag: "Authentic & Verified"
    },
    {
      icon: HeartHandshake,
      title: "The 'Undetectable Glow' Ethos",
      description: "Our philosophy celebrates natural structural harmony. We never promote over-filled or artificial aesthetics—only rested, radiant vitality.",
      tag: "Natural Results"
    },
    {
      icon: Smartphone,
      title: "Seamless BookFlow Experience",
      description: "Zero waiting room friction. Effortlessly book your exact preferred provider, receive automated prep instructions via SMS, and manage appointments seamlessly.",
      tag: "Instant Online Booking"
    }
  ];

  return (
    <section id="why-us" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
            <Award className="w-3.5 h-3.5" />
            The Lumina Standard
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light serif text-[#1A1C1A]">
            Where Science Meets Serenity
          </h2>
          <p className="text-base text-[#6B6E6B] leading-relaxed">
            We bridge the gap between rigorous medical dermatology and the restorative ambiance of a luxury sanctuary.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm hover:border-[#8B9D83] transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F5F7F4] text-[#8B9D83] flex items-center justify-center group-hover:bg-[#8B9D83] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8B9D83]">
                      {pillar.tag}
                    </span>
                    <h3 className="text-lg font-serif text-[#1A1C1A]">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F0EDE8] flex items-center gap-1.5 text-xs text-[#2D302E] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8B9D83]" />
                  <span>Clinical Guarantee</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clinical Proof Statistics Bar */}
        <div className="bg-[#1A1C1A] rounded-2xl p-8 sm:p-10 text-white shadow-xl border border-[#2D302E]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-[#2D302E]">
            <div className="space-y-1 pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-serif text-[#8B9D83] font-light">
                {SPA_INFO.stats.clientsServed}
              </p>
              <p className="text-xs uppercase tracking-wider text-[#A5A29D] font-medium">
                Clinical Treatments Delivered
              </p>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-serif text-[#8B9D83] font-light">
                {SPA_INFO.stats.satisfactionRate}
              </p>
              <p className="text-xs uppercase tracking-wider text-[#A5A29D] font-medium">
                Verified Client Satisfaction
              </p>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-serif text-[#8B9D83] font-light">
                {SPA_INFO.stats.yearsExperience}
              </p>
              <p className="text-xs uppercase tracking-wider text-[#A5A29D] font-medium">
                Years of Medical Leadership
              </p>
            </div>

            <div className="space-y-1 pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-serif text-[#8B9D83] font-light">
                {SPA_INFO.stats.doctorLed}
              </p>
              <p className="text-xs uppercase tracking-wider text-[#A5A29D] font-medium">
                Doctor-Engineered Protocols
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
