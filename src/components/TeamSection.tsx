import React from 'react';
import { ShieldCheck, Award, GraduationCap, Calendar, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onBookWithSpecialist: (specialistId: string) => void;
}

const TEAM_MEMBERS = [
  {
    id: 'dr-emma-harrison',
    name: "Dr. Emma Harrison, MD",
    role: "Medical Director & Board-Certified Dermatologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    education: "Stanford University School of Medicine (MD) • Board Certified Dermatology",
    quote: "True aesthetic medicine is not about altering who you are, but restoring the natural balance and vitality of your skin.",
    specialties: ["Full Facial Harmonization", "Advanced Neuromodulators", "Biostimulatory Fillers (Sculptra)"],
    favorite: "Bespoke Liquid Facelift Protocol"
  },
  {
    id: 'sarah-jenkins',
    name: "Sarah Jenkins, LE, CLT",
    role: "Lead Clinical Aesthetician & Laser Specialist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    education: "CIDESCO International Diplomat • Certified Laser Technician (CLT)",
    quote: "Healthy, luminous skin is built on cellular integrity, clinical actives, and meticulous barrier care.",
    specialties: ["Platinum HydraFacial®", "Medical-Grade Chemical Peels", "RF Microneedling"],
    favorite: "Triple Acid Glow & Infusion Peel"
  },
  {
    id: 'michael-chang',
    name: "Michael Chang, RN, BSN",
    role: "Aesthetic Injector & Micro-Cannula Specialist",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    education: "Johns Hopkins University (BSN, RN) • Certified Aesthetic Nurse Specialist (CANS)",
    quote: "Precision and micro-dosing ensure subtle rejuvenation that moves naturally with your expressions.",
    specialties: ["Micro-Cannula Tear Trough", "Lip Architecture", "Preventative Tox"],
    favorite: "Under-Eye Brightening Restoration"
  },
  {
    id: 'elena-vancet',
    name: "Elena Vancet, LMT, CCE",
    role: "Master Body Contouring & Lymphatic Specialist",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    education: "Swedish Institute College of Health Sciences • Certified Clinical Electrologist",
    quote: "Detoxification and structural lymphatic drainage are the foundation of sculpted, radiant skin.",
    specialties: ["Sculptural Face Massage", "Post-Op Lymphatic Drainage", "Radiofrequency Body Sculpting"],
    favorite: "Sculpt & Contour Buccal Facial"
  }
];

export const TeamSection: React.FC<TeamSectionProps> = ({ onBookWithSpecialist }) => {
  return (
    <section id="team" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
            <Award className="w-3.5 h-3.5" />
            World-Class Clinical Practitioners
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light serif text-[#1A1C1A]">
            Meet Our Medical & Aesthetic Team
          </h2>
          <p className="text-base text-[#6B6E6B] leading-relaxed">
            Led by board-certified dermatologist Dr. Emma Harrison and master aesthetician Sarah Jenkins, our practitioners blend decades of academic medicine with an artistic eye for natural beauty.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {TEAM_MEMBERS.slice(0, 2).map((member) => (
            <div
              key={member.name}
              id={`team-featured-${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#F0EDE8]">
                  <div className="relative shrink-0">
                     <img
                       src={member.image}
                       alt={member.name}
                       referrerPolicy="no-referrer"
                       className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-stone-200"
                       onError={(e) => {
                         e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';
                       }}
                     />
                    <span className="absolute -bottom-2 -right-2 bg-[#1A1C1A] text-[#8B9D83] p-1.5 rounded-xl border border-[#8B9D83]/40 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-[11px] font-semibold uppercase border border-[#F0EDE8]">
                      {member.role}
                    </div>
                    <h3 className="text-2xl font-serif text-[#1A1C1A] flex items-center justify-center sm:justify-start gap-2">
                      {member.name}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Pro
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="py-6 space-y-4 text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                  <div className="flex items-start gap-2 text-xs bg-stone-50 border border-stone-100 rounded-xl p-3 text-stone-700">
                    <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="font-medium">{member.education}</span>
                  </div>

                  <div className="flex items-start gap-2 italic text-xs text-stone-700 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3">
                    <MessageSquareQuote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 not-italic" />
                    <span>&ldquo;{member.quote}&rdquo;</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] uppercase tracking-wider text-[#8B8D8B] font-semibold">
                      Core Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-[#6B6E6B]">
                  Favorite: <strong className="text-[#1A1C1A]">{member.favorite}</strong>
                </div>
                <button
                  onClick={() => onBookWithSpecialist(member.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black transition-all shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#8B9D83]" />
                  <span>Book with {member.name.split(',')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEAM_MEMBERS.slice(2).map((member) => (
            <div
              key={member.name}
              id={`team-secondary-${member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 pb-4 border-b border-[#F0EDE8]">
                   <img
                     src={member.image}
                     alt={member.name}
                     referrerPolicy="no-referrer"
                     className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-stone-200"
                     onError={(e) => {
                       e.currentTarget.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80';
                     }}
                   />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8B9D83] bg-[#F5F7F4] px-2 py-0.5 rounded-full border border-[#F0EDE8]">
                      {member.role}
                    </span>
                    <h4 className="text-lg font-serif text-[#1A1C1A] mt-0.5 flex items-center gap-2">
                      {member.name}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Pro
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="py-4 space-y-3 text-xs text-[#6B6E6B] leading-relaxed">
                  <div className="flex items-start gap-2 text-xs bg-stone-50 border border-stone-100 rounded-xl p-3 text-stone-700">
                    <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="font-medium">{member.education}</span>
                  </div>

                  <div className="flex items-start gap-2 italic text-xs text-stone-700 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3">
                    <MessageSquareQuote className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 not-italic" />
                    <span>&ldquo;{member.quote}&rdquo;</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {member.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EDE8] flex items-center justify-between">
                <span className="text-[11px] text-[#6B6E6B]">
                  Favorite: <strong className="text-[#1A1C1A]">{member.favorite}</strong>
                </span>
                <button
                  onClick={() => onBookWithSpecialist(member.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black transition-colors shadow-xs"
                >
                  <Calendar className="w-3 h-3 text-[#8B9D83]" />
                  <span>Book with {member.name.split(',')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
