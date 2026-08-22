import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Shield, Clock, Flame, Zap } from 'lucide-react';
import { SERVICES, TEAM_MEMBERS } from '../data/spaData';
import { Service } from '../types';

interface TreatmentMatcherProps {
  onSelectTreatmentForBooking: (serviceId: string, specialistId?: string) => void;
  onOpenDetails: (service: Service) => void;
}

interface ConcernOption {
  id: string;
  label: string;
  sublabel: string;
  recommendedServiceId: string;
  recommendedSpecialistId: string;
  iconName: string;
}

const CONCERNS: ConcernOption[] = [
  {
    id: 'pores-dullness',
    label: 'Dull Skin & Congested Pores',
    sublabel: 'Blackheads, flaky skin, lack of glow',
    recommendedServiceId: 'hydrafacial-platinum',
    recommendedSpecialistId: 'sarah-jenkins',
    iconName: 'sparkles'
  },
  {
    id: 'melasma-hyperpigmentation',
    label: 'Sun Damage & Dark Spots',
    sublabel: 'Melasma, acne scars, uneven tone',
    recommendedServiceId: 'medical-chemical-peel',
    recommendedSpecialistId: 'sarah-jenkins',
    iconName: 'zap'
  },
  {
    id: 'fine-lines-elasticity',
    label: 'Skin Laxity & Deep Wrinkles',
    sublabel: 'Loss of firmness, neck lines, jowls',
    recommendedServiceId: 'rf-microneedling',
    recommendedSpecialistId: 'dr-emma-harrison',
    iconName: 'flame'
  },
  {
    id: 'expression-lines',
    label: 'Forehead Lines & Crow\'s Feet',
    sublabel: 'Dynamic muscle movement wrinkles',
    recommendedServiceId: 'precision-botox-injectables',
    recommendedSpecialistId: 'dr-emma-harrison',
    iconName: 'shield'
  }
];

export const TreatmentMatcher: React.FC<TreatmentMatcherProps> = ({
  onSelectTreatmentForBooking,
  onOpenDetails,
}) => {
  const [selectedConcernId, setSelectedConcernId] = useState<string>('pores-dullness');

  const currentConcern = CONCERNS.find((c) => c.id === selectedConcernId) || CONCERNS[0];
  const matchedService = SERVICES.find((s) => s.id === currentConcern.recommendedServiceId);
  const matchedSpecialist = TEAM_MEMBERS.find((t) => t.id === currentConcern.recommendedSpecialistId);

  if (!matchedService) return null;

  return (
    <section id="treatment-matcher" className="py-16 bg-[#F9F8F6] border-y border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
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

        {/* Interactive Matcher Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Concern Selector Buttons */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider text-[#8B8D8B] font-semibold mb-1">
              Step 1: Choose Your Primary Focus
            </p>
            {CONCERNS.map((concern) => {
              const isSelected = concern.id === selectedConcernId;
              return (
                <button
                  key={concern.id}
                  id={`concern-btn-${concern.id}`}
                  onClick={() => setSelectedConcernId(concern.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#8B9D83] shadow-sm ring-1 ring-[#8B9D83]'
                      : 'bg-white/60 hover:bg-white border-[#F0EDE8] text-[#2D302E]'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-[#1A1C1A] block">
                      {concern.label}
                    </span>
                    <span className="text-xs text-[#6B6E6B] block">
                      {concern.sublabel}
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

          {/* Right Column: Matched Recommendation Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm flex flex-col justify-between h-full">
              
              <div>
                {/* Header Tag */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#F0EDE8]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8B9D83] bg-[#F5F7F4] px-3 py-1 rounded-full border border-[#F0EDE8]">
                    Recommended Clinical Match
                  </span>
                  <span className="text-xs text-[#8B8D8B] font-medium">
                    Duration: <strong className="text-[#1A1C1A]">{matchedService.duration}</strong> • Downtime: <strong className="text-[#1A1C1A]">{matchedService.downtime}</strong>
                  </span>
                </div>

                {/* Treatment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 my-6 items-center">
                  <div className="sm:col-span-4 aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-[#F0EDE8]">
                    <img
                      src={matchedService.image}
                      alt={matchedService.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xl sm:text-2xl font-serif text-[#1A1C1A]">
                        {matchedService.name}
                      </h3>
                      <span className="text-lg font-semibold text-[#8B9D83]">
                        {matchedService.price}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                      {matchedService.description}
                    </p>

                    {/* Specialist recommendation snippet */}
                    {matchedSpecialist && (
                      <div className="pt-2 flex items-center gap-2.5 text-xs text-[#6B6E6B]">
                        <img
                          src={matchedSpecialist.avatar}
                          alt={matchedSpecialist.name}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-full object-cover border border-[#8B9D83]"
                        />
                        <span>
                          Recommended Specialist: <strong className="text-[#1A1C1A]">{matchedSpecialist.name}</strong> ({matchedSpecialist.role})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Benefits Pills */}
                <div className="space-y-2 pt-2 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8B8D8B]">
                    Key Clinical Benefits
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedService.benefits.slice(0, 4).map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#2D302E]">
                        <Check className="w-3.5 h-3.5 text-[#8B9D83] shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#F0EDE8] flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="matcher-book-now-btn"
                  onClick={() => onSelectTreatmentForBooking(matchedService.id, matchedSpecialist?.id)}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black shadow-xs active:scale-98 transition-all"
                >
                  <span>Book This Protocol with BookFlow</span>
                  <ArrowRight className="w-4 h-4 text-[#8B9D83]" />
                </button>

                <button
                  id="matcher-quick-view-btn"
                  onClick={() => onOpenDetails(matchedService)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-full border border-[#F0EDE8] text-[#2D302E] text-sm font-medium hover:bg-[#F5F7F4] transition-colors"
                >
                  View Full Step-by-Step
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
