import React from 'react';
import { Coffee, Wind, Sparkles, Moon, ShieldCheck, Heart } from 'lucide-react';

export const SanctuarySection: React.FC = () => {
  const amenities = [
    {
      icon: Moon,
      title: "Private Soundproof Suites",
      desc: "Designed with acoustic insulation and warm ambient dimming for complete tranquility."
    },
    {
      icon: Coffee,
      title: "Botanical Elixir & Herbal Tea Lounge",
      desc: "Enjoy organic collagen infusions and calming adaptogenic teas before your session."
    },
    {
      icon: Wind,
      title: "Hospital-Grade HEPA Filtration",
      desc: "Pristine, medical-grade air purity in every treatment room for total wellness."
    },
    {
      icon: Sparkles,
      title: "Heated Ergonomic Loungers",
      desc: "Memory-foam therapeutic beds with optional weighted plush throws for deep relaxation."
    }
  ];

  return (
    <section id="sanctuary" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Photos Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-sm aspect-3/4 border border-[#F0EDE8]">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Lumina luxury treatment suite"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#F0EDE8] text-xs text-[#6B6E6B]">
                <p className="font-semibold text-[#1A1C1A]">Private Suite Experience</p>
                <p className="mt-0.5">Every client receives a dedicated sanctuary room with personalized aroma selection.</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="p-4 rounded-2xl bg-[#1A1C1A] text-white text-xs border border-[#2D302E]">
                <div className="flex items-center gap-1 text-[#8B9D83] font-semibold uppercase text-[10px]">
                  <Sparkles className="w-3 h-3" /> Comfort Guarantee
                </div>
                <p className="text-[#A5A29D] mt-1">Zero rushed appointments. Dedicated 15-minute relaxation buffer between each patient.</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-sm aspect-3/4 border border-[#F0EDE8]">
                <img
                  src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80"
                  alt="Lumina relaxation tea lounge"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Amenities List */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
              <Heart className="w-3.5 h-3.5" />
              The Boutique Environment
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-light serif text-[#1A1C1A] leading-tight">
              A Serene Sanctuary Designed to Soothe Your Nervous System
            </h2>

            <p className="text-base text-[#6B6E6B] leading-relaxed">
              We believe stress directly impacts skin health. At Lumina, we engineered an immersive environment where clinical efficacy is paired with calming sensory wellness.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {amenities.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-[#F0EDE8] shadow-xs space-y-2 group hover:border-[#8B9D83] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F7F4] text-[#8B9D83] flex items-center justify-center group-hover:bg-[#8B9D83] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#1A1C1A]">{item.title}</h4>
                    <p className="text-xs text-[#6B6E6B] leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
