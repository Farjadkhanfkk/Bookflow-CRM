import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, GraduationCap, Calendar, Sparkles, Heart, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TeamMember } from '../types';

interface TeamSectionProps {
  onBookWithSpecialist: (specialistId: string) => void;
}

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
        setTeamMembers(data ?? []);
      } catch (e: any) {
        console.error('Error fetching staff:', e);
        setError('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  if (loading) return <div className="py-20 text-center">Loading team...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;

  return (
    <section id="team" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ... (rest of the component structure) */}
        
        {/* Section Header */}
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

        {/* Highlighted Key Providers: Dr. Emma & Sarah Jenkins (Featured 2-Column Showcase) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {teamMembers.slice(0, 2).map((member: TeamMember) => (
            <div
              key={member.id}
              id={`team-featured-${member.id}`}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Top Profile Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-[#F0EDE8]">
                  <div className="relative shrink-0">
                     <img
                       src={member.avatar || (member as any).avatar_url || (member as any).image || DEFAULT_AVATAR}
                       alt={member.name}
                       referrerPolicy="no-referrer"
                       className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover object-top border border-[#F0EDE8] shadow-xs"
                     />
                    <span className="absolute -bottom-2 -right-2 bg-[#1A1C1A] text-[#8B9D83] p-1.5 rounded-xl border border-[#8B9D83]/40 shadow-xs">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                     <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-[11px] font-semibold uppercase border border-[#F0EDE8]">
                       {member.role ?? ''}
                     </div>
                     <h3 className="text-2xl font-serif text-[#1A1C1A]">
                       {member.name ?? ''}
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

                {/* Bio & Education */}
                 <div className="py-6 space-y-4 text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
                   <p>{member.bio ?? ''}</p>

                   <div className="flex items-start gap-2 text-xs bg-[#F9F8F6] p-3 rounded-xl border border-[#F0EDE8]">
                     <GraduationCap className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5" />
                     <span className="text-[#2D302E] font-medium">{member.education ?? ''}</span>
                   </div>

                   {/* Philosophy Quote */}
                   <div className="flex items-start gap-2 italic text-xs text-[#2D302E] bg-[#F5F7F4] p-3 rounded-xl border-l-2 border-[#8B9D83]">
                     <MessageSquareQuote className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5 not-italic" />
                     <span>&ldquo;{member.quote ?? ''}&rdquo;</span>
                   </div>

                   {/* Specialties List */}
                   <div className="space-y-1.5 pt-2">
                     <p className="text-[11px] uppercase tracking-wider text-[#8B8D8B] font-semibold">
                       Core Specialties:
                     </p>
                     <div className="flex flex-wrap gap-1.5">
                       {(member.specialties ?? (member as any).specialties ?? []).map((spec: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F7F4] border border-[#F0EDE8] text-[#2D302E] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
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
                   <span>Book with {(member.name ?? '').split(' ')[0]} {(member.name ?? '').split(' ')[1]}</span>
                 </button>
              </div>

            </div>
          ))}
        </div>

        {/* Secondary Specialists Grid (Michael Chang & Elena Vance) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.slice(2).map((member: TeamMember) => (
            <div
              key={member.id}
              id={`team-secondary-${member.id}`}
              className="bg-white rounded-2xl p-6 border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all flex flex-col justify-between"
            >
              <div>
                 <div className="flex items-center gap-4 pb-4 border-b border-[#F0EDE8]">
                    <img
                      src={member.avatar || (member as any).avatar_url || (member as any).image || DEFAULT_AVATAR}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-[#F0EDE8]"
                    />
                   <div>
                     <span className="text-[10px] uppercase font-semibold text-[#8B9D83] bg-[#F5F7F4] px-2 py-0.5 rounded-full border border-[#F0EDE8]">
                       {member.role ?? ''}
                     </span>
                     <h4 className="text-lg font-serif text-[#1A1C1A] mt-0.5">
                       {member.name ?? ''}
                     </h4>
                     <p className="text-xs text-[#6B6E6B]">
                       {member.credentials ?? ''} • {member.experience ?? ''}
                     </p>
                   </div>
                 </div>

                 <p className="text-xs text-[#6B6E6B] py-4 leading-relaxed">
                   {member.bio ?? ''}
                 </p>

                 <div className="flex flex-wrap gap-1 mb-4">
                   {(member.specialties ?? (member as any).specialties ?? []).map((spec: string, i: number) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F7F4] border border-[#F0EDE8] text-[#2D302E]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EDE8] flex items-center justify-between">
                <span className="text-[11px] text-[#6B6E6B]">
                  Direct BookFlow availability open
                </span>
                <button
                  onClick={() => onBookWithSpecialist(member.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-[#2D302E] text-xs font-medium border border-[#F0EDE8] transition-colors"
                >
                  <Calendar className="w-3 h-3 text-[#8B9D83]" />
                  <span>Select</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

