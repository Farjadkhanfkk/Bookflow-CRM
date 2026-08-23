import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, GraduationCap, Calendar, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onBookWithSpecialist: (specialistId: string) => void;
}

const FALLBACK_TEAM: TeamMember[] = [
  {
    id: 'dr-emma-harrison',
    name: 'Dr. Emma Harrison, MD',
    title: 'Medical Director & Board-Certified Dermatologist',
    role: 'Physician & Founder',
    credentials: 'MD, FAAD, Board-Certified',
    experience: '16+ Years Experience',
    bio: 'Dr. Emma Harrison completed her dermatology residency and fellowship at Stanford Medicine and Harvard. Renowned for her conservative, artful approach to facial balancing and regenerative aesthetics, Dr. Emma personally designs every treatment protocol at Lumina.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    specialties: ['Full Facial Harmonization', 'Advanced Neuromodulators', 'Biostimulatory Fillers (Sculptra)'],
    favoriteTreatment: 'Bespoke Liquid Facelift Protocol',
    quote: 'True aesthetic medicine is not about altering who you are, but restoring the natural balance and vitality of your skin.',
    education: 'Stanford University School of Medicine (MD) • Board Certified Dermatology'
  },
  {
    id: 'sarah-jenkins',
    name: 'Sarah Jenkins, LE, CLT',
    title: 'Lead Clinical Aesthetician & Laser Specialist',
    role: 'Master Aesthetician',
    credentials: 'LE, CLT, Master HydraFacial Specialist',
    experience: '11+ Years Experience',
    bio: 'Sarah is our celebrated master aesthetician with over a decade of clinical experience in medical peels, laser resurfacing, and stubborn pigment correction. Her holistic skin consultations have transformed thousands of complex acne and melasma conditions.',
    avatar: 'https://images.unsplash.com/photo-1594824813511-208cb21ec68a?auto=format&fit=crop&w=600&q=80',
    specialties: ['Platinum HydraFacial®', 'Medical-Grade Chemical Peels', 'RF Microneedling'],
    favoriteTreatment: 'Triple Acid Glow & Infusion Peel',
    quote: 'Healthy, luminous skin is built on cellular integrity, clinical actives, and meticulous barrier care.',
    education: 'CIDESCO International Diplomat • Certified Laser Technician (CLT)'
  },
  {
    id: 'michael-chang',
    name: 'Michael Chang, RN, BSN',
    title: 'Aesthetic Injector & Micro-Cannula Specialist',
    role: 'Injectables Specialist',
    credentials: 'RN, BSN, CANS Certified',
    experience: '8+ Years Experience',
    bio: 'Michael blends surgical precision with an intuitive eye for facial proportion. Having performed thousands of injectable treatments, he specializes in painless micro-cannula lip contouring, jawline sculpting, and smooth natural wrinkle relaxation.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    specialties: ['Micro-Cannula Tear Trough', 'Lip Architecture', 'Preventative Tox'],
    favoriteTreatment: 'Under-Eye Brightening Restoration',
    quote: 'Precision and micro-dosing ensure subtle rejuvenation that moves naturally with your expressions.',
    education: 'Johns Hopkins University (BSN, RN) • Certified Aesthetic Nurse Specialist (CANS)'
  },
  {
    id: 'elena-vancet',
    name: 'Elena Vancet, LMT, CCE',
    title: 'Master Body Contouring & Lymphatic Specialist',
    role: 'Wellness & Lymphatic Expert',
    credentials: 'LMT, Vodder Certified Lymphatic Specialist',
    experience: '9+ Years Experience',
    bio: 'Elena specializes in post-procedure recovery, facial sculpting massage, and full-body lymphatic drainage. Her treatments dramatically reduce inflammation, flush toxins, and impart a profound sense of inner calm.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    specialties: ['Sculptural Face Massage', 'Post-Op Lymphatic Drainage', 'Radiofrequency Body Sculpting'],
    favoriteTreatment: 'Sculpt & Contour Buccal Facial',
    quote: 'Detoxification and structural lymphatic drainage are the foundation of sculpted, radiant skin.',
    education: 'Swedish Institute College of Health Sciences • Certified Clinical Electrologist'
  }
];

export const TeamSection: React.FC<TeamSectionProps> = ({ onBookWithSpecialist }) => {
  const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1594824813511-208cb21ec68a?auto=format&fit=crop&q=80&w=400';
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('staff_members').select('*');
        if (error) {
          console.error('Error fetching staff:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setError(error.message);
          return;
        }
        const fetched = data ?? [];
        setTeamMembers(fetched.length > 0 ? fetched : FALLBACK_TEAM);
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error('Error fetching staff:', e);
        } else {
          console.error('Error fetching staff:', String(e));
        }
        setError('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const displayMembers = teamMembers.length > 0 ? teamMembers : FALLBACK_TEAM;

  if (loading) return <div className="py-20 text-center">Loading team...</div>;
  if (error && displayMembers.length === 0) return <div className="py-20 text-center text-red-500">{error}</div>;

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
          {displayMembers.slice(0, 2).map((member: TeamMember) => (
            <div
              key={member.id}
              id={`team-featured-${member.id}`}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#F0EDE8]">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar || DEFAULT_AVATAR}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-stone-200"
                    />
                    <span className="absolute -bottom-2 -right-2 bg-[#1A1C1A] text-[#8B9D83] p-1.5 rounded-xl border border-[#8B9D83]/40 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-[11px] font-semibold uppercase border border-[#F0EDE8]">
                      {member.role ?? ''}
                    </div>
                    <h3 className="text-2xl font-serif text-[#1A1C1A] flex items-center justify-center sm:justify-start gap-2">
                      {member.name ?? ''}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Pro
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-[#6B6E6B]">
                      {member.title ?? ''}
                    </p>
                    <p className="text-xs text-[#8B9D83] font-medium flex items-center justify-center sm:justify-start gap-1 pt-1">
                      <Award className="w-3.5 h-3.5" />
                      {member.experience ?? ''}
                    </p>
                  </div>
                </div>

                <div className="py-6 space-y-4 text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                  <p>{member.bio ?? ''}</p>

                  <div className="flex items-start gap-2 text-xs bg-stone-50 border border-stone-100 rounded-xl p-3 text-stone-700">
                    <GraduationCap className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5" />
                    <span className="font-medium">{member.education ?? ''}</span>
                  </div>

                  <div className="flex items-start gap-2 italic text-xs text-stone-700 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3">
                    <MessageSquareQuote className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5 not-italic" />
                    <span>&ldquo;{member.quote ?? ''}&rdquo;</span>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] uppercase tracking-wider text-[#8B8D8B] font-semibold">
                      Core Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(member.specialties ?? []).map((spec: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700"
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
                  Favorite: <strong className="text-[#1A1C1A]">{member.favoriteTreatment ?? ''}</strong>
                </div>
                <button
                  id={`book-with-${member.id}`}
                  onClick={() => onBookWithSpecialist(member.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black transition-all shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#8B9D83]" />
                  <span>Book with {member.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayMembers.slice(2).map((member: TeamMember) => (
            <div
              key={member.id}
              id={`team-secondary-${member.id}`}
              className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 pb-4 border-b border-[#F0EDE8]">
                  <img
                    src={member.avatar || DEFAULT_AVATAR}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-1 ring-stone-200"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#8B9D83] bg-[#F5F7F4] px-2 py-0.5 rounded-full border border-[#F0EDE8]">
                      {member.role ?? ''}
                    </span>
                    <h4 className="text-lg font-serif text-[#1A1C1A] mt-0.5 flex items-center gap-2">
                      {member.name ?? ''}
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Pro
                      </span>
                    </h4>
                    <p className="text-xs text-[#6B6E6B]">
                      {member.credentials ?? ''} • {member.experience ?? ''}
                    </p>
                  </div>
                </div>

                <div className="py-4 space-y-3 text-xs text-[#6B6E6B] leading-relaxed">
                  <p>{member.bio ?? ''}</p>

                  <div className="flex items-start gap-2 text-xs bg-stone-50 border border-stone-100 rounded-xl p-3 text-stone-700">
                    <GraduationCap className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5" />
                    <span className="font-medium">{member.education ?? ''}</span>
                  </div>

                  <div className="flex items-start gap-2 italic text-xs text-stone-700 bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3">
                    <MessageSquareQuote className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5 not-italic" />
                    <span>&ldquo;{member.quote ?? ''}&rdquo;</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(member.specialties ?? []).map((spec: string, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EDE8] flex items-center justify-between">
                <span className="text-[11px] text-[#6B6E6B]">
                  Favorite: <strong className="text-[#1A1C1A]">{member.favoriteTreatment ?? ''}</strong>
                </span>
                <button
                  onClick={() => onBookWithSpecialist(member.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black transition-colors shadow-xs"
                >
                  <Calendar className="w-3 h-3 text-[#8B9D83]" />
                  <span>Book with {member.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
