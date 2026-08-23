import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Service } from '../types';

interface Protocol {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  downtime: string;
  price: string;
  benefits: string[];
  specialistName: string;
  specialistRole: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: 'dull-skin',
    title: 'Platinum HydraFacial® MD',
    description: 'Vortex-infusion deep cleanse, painless extractions, peptide infusion & LED light therapy for immediate radiance.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    duration: '60 min',
    downtime: 'Zero (Instant Glow)',
    price: '$295',
    benefits: [
      'Immediate visible radiance without irritation',
      'Painless vortex-suction blackhead extraction',
      'Medical-grade hyaluronic acid and peptide bath',
      'Lymphatic drainage detox to contour cheekbones'
    ],
    specialistName: 'Sarah Jenkins, LE, CLT',
    specialistRole: 'Master Aesthetician'
  },
  {
    id: 'sun-damage',
    title: 'Medical-Grade Chemical Peel',
    description: 'Customized clinical acid formulation to dramatically resurface sun damage & hyperpigmentation.',
    image: 'https://images.unsplash.com/photo-1512290903671-17adc8174f88?auto=format&fit=crop&w=800&q=80',
    duration: '45 min',
    downtime: '2–4 Days (Gentle Flaking)',
    price: '$225',
    benefits: [
      'Significantly fades stubborn dark spots & post-acne marks',
      'Stimulates deep epidermal collagen turnover',
      'Smoothes rough texture and refines enlarged pores',
      'Includes take-home post-peel recovery serum kit'
    ],
    specialistName: 'Sarah Jenkins, LE, CLT',
    specialistRole: 'Master Aesthetician'
  },
  {
    id: 'skin-laxity',
    title: 'Morpheus8 RF Microneedling',
    description: 'Subdermal fractional radiofrequency to tighten, sculpt, and rebuild elastin for firmer skin.',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    duration: '75 min',
    downtime: '24–48 Hours (Mild Pinkness)',
    price: '$650',
    benefits: [
      'Reaches up to 4mm depth for structural tightening',
      'Dramatic boost in natural collagen and elastin synthesis',
      'Safe and effective across all skin tones (Fitzpatrick I-VI)',
      'Includes topical prescription numbing for maximum comfort'
    ],
    specialistName: 'Dr. Emma Harrison, MD',
    specialistRole: 'Medical Director'
  },
  {
    id: 'forehead-lines',
    title: 'Physician-Led Botox® & Dysport®',
    description: 'Subtle, natural-looking muscle relaxation that preserves your expressive grace and movement.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    duration: '30 min',
    downtime: 'Zero (Lunchtime Procedure)',
    price: '$14 / unit',
    benefits: [
      'Conservative dosing tailored to your muscle anatomy',
      'No frozen or unnatural look',
      'Results appear in 3–7 days and last 3–5 months',
      'Complimentary 2-week touch-up assessment'
    ],
    specialistName: 'Dr. Emma Harrison, MD',
    specialistRole: 'Medical Director'
  }
];

interface SkinMatcherProps {
  onSelectTreatmentForBooking: (serviceId: string, specialistId?: string) => void;
  onOpenDetails: (service: Service) => void;
}

export const SkinMatcher: React.FC<SkinMatcherProps> = ({
  onSelectTreatmentForBooking,
  onOpenDetails,
}) => {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('dull-skin');
  const selectedProtocol = PROTOCOLS.find((p) => p.id === selectedProtocolId) || PROTOCOLS[0];

  return (
    <section id="treatment-matcher" className="py-16 bg-[#F9F8F6] border-y border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Skin Concierge
          </div>
          <h2 className="text-3xl sm:text-4xl font-light serif text-[#1A1C1A]">
            Find Your Ideal Treatment Protocol
          </h2>
          <p className="text-[#6B6E6B] text-sm sm:text-base">
            Select your primary skin or wellness goal to view the clinical recommendation curated by Dr. Emma and Sarah.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-[#8B8D8B] font-semibold mb-1">
              Step 1: Choose Your Primary Focus
            </p>
            {PROTOCOLS.map((protocol) => {
              const isSelected = protocol.id === selectedProtocolId;
              return (
                <button
                  key={protocol.id}
                  onClick={() => setSelectedProtocolId(protocol.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#8B9D83] shadow-sm ring-1 ring-[#8B9D83]'
                      : 'bg-white/60 hover:bg-white border-[#F0EDE8] text-[#2D302E]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-[#1A1C1A] block">
                      {protocol.title}
                    </span>
                    <span className="text-xs text-[#6B6E6B] block">
                      {protocol.description}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      isSelected ? 'bg-[#8B9D83] text-white' : 'bg-[#F5F7F4] text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm w-full">
              <div className="flex flex-col md:flex-row gap-6 items-start w-full">
                <img
                  src={selectedProtocol.image}
                  alt={selectedProtocol.title}
                  className="w-full md:w-56 h-52 md:h-56 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 object-cover"
                />
                <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F0EDE8]">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#8B9D83] bg-[#F5F7F4] px-3 py-1 rounded-full border border-[#F0EDE8]">
                        Recommended Clinical Match
                      </span>
                      <span className="text-xs text-[#8B8D8B] font-medium">
                        Duration: <strong className="text-[#1A1C1A]">{selectedProtocol.duration}</strong> • Downtime: <strong className="text-[#1A1C1A]">{selectedProtocol.downtime}</strong>
                      </span>
                    </div>

                    <div className="my-6 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-xl sm:text-2xl font-serif text-[#1A1C1A]">
                          {selectedProtocol.title}
                        </h3>
                        <span className="text-lg font-semibold text-[#8B9D83]">
                          {selectedProtocol.price}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                        {selectedProtocol.description}
                      </p>

                      <div className="pt-2 flex items-center gap-2.5 text-xs text-[#6B6E6B]">
                        <div className="w-6 h-6 rounded-full bg-[#F5F7F4] flex items-center justify-center text-[10px] font-bold text-[#8B9D83]">
                          {selectedProtocol.specialistName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span>
                          Recommended Specialist: <strong className="text-[#1A1C1A]">{selectedProtocol.specialistName}</strong> ({selectedProtocol.specialistRole})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8D8B]">
                        Key Clinical Benefits
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-600">
                        {selectedProtocol.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#8B9D83] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#F0EDE8] flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => onSelectTreatmentForBooking(selectedProtocol.id, selectedProtocol.specialistName)}
                      className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black shadow-xs active:scale-98 transition-all"
                    >
                      <span>Book This Protocol with BookFlow</span>
                      <ArrowRight className="w-4 h-4 text-[#8B9D83]" />
                    </button>
                    <button
                      onClick={() => onOpenDetails(selectedProtocol as unknown as Service)}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-[#F0EDE8] text-[#2D302E] text-sm font-medium hover:bg-[#F5F7F4] transition-colors"
                    >
                      View Full Step-by-Step
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
