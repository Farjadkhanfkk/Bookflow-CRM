import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Eye, Check, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Service, ServiceCategory } from '../types';

interface FeaturedServicesProps {
  onSelectServiceForBooking: (serviceId: string) => void;
  onOpenDetails: (service: Service) => void;
}

export const FeaturedServices: React.FC<FeaturedServicesProps> = ({
  onSelectServiceForBooking,
  onOpenDetails,
}) => {
  const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('services').select('*');
        if (error) {
          console.error('Error fetching services:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setError(error.message);
          return;
        }
        setServices(data ?? []);
      } catch (e: any) {
        console.error('Error fetching services:', e);
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const categories: { id: ServiceCategory; label: string }[] = [
    { id: 'all', label: 'All Treatments' },
    { id: 'facials', label: 'Facials & Peels' },
    { id: 'lasers', label: 'Lasers & RF Tightening' },
    { id: 'injectables', label: 'Injectables & Botox' },
    { id: 'body-wellness', label: 'Wellness & IV Drip' },
  ];

  const filteredServices = activeCategory === 'all' 
    ? services 
    : services.filter((s) => s.category === activeCategory);

  if (loading) return <div className="py-20 text-center">Loading services...</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;

  return (
    <section id="services" className="py-20 bg-[#FDFCFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ... (rest of the UI remains the same) */}
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
              <Sparkles className="w-3.5 h-3.5" />
              Physician-Formulated Treatments
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light serif text-[#1A1C1A]">
              Featured Aesthetic Services
            </h2>
            <p className="text-sm sm:text-base text-[#6B6E6B] leading-relaxed">
              Every procedure is customized to your unique dermal biology using FDA-cleared clinical technology and soothing botanical recovery protocols.
            </p>
          </div>

          {/* Quick Consultation Callout */}
          <div className="hidden md:flex items-center gap-3 p-4 rounded-2xl bg-[#F9F8F6] border border-[#F0EDE8]">
            <div className="p-2.5 rounded-xl bg-white text-[#8B9D83] shadow-xs border border-[#F0EDE8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-[#1A1C1A]">First Time at Lumina?</p>
              <p className="text-[#6B6E6B]">Includes complimentary skin scan</p>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`category-filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#2D302E] text-white shadow-xs'
                    : 'bg-white border border-[#F0EDE8] text-[#6B6E6B] hover:text-[#2D302E] hover:bg-[#F5F7F4]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-[#F0EDE8] shadow-sm hover:shadow-md hover:border-[#8B9D83] transition-all duration-300 flex flex-col group"
            >
              {/* Image Container with Badges */}
              <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={service.image || (service as any).image_url || DEFAULT_SERVICE_IMAGE}
                  alt={service.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C1A]/50 via-transparent to-transparent" />

                {/* Popular Pill */}
                {service.popular && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#8B9D83] text-[10px] font-semibold tracking-wider uppercase border border-[#F0EDE8] shadow-xs">
                    <Sparkles className="w-3 h-3 text-[#8B9D83]" /> Most Requested
                  </span>
                )}

                {/* Price Tag Pill */}
                 <span className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-[#1A1C1A]/90 backdrop-blur-md text-white text-xs font-semibold shadow-xs">
                   {service.price ?? ''}
                 </span>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Duration and Downtime Meta */}
                  <div className="flex items-center justify-between text-xs text-[#8B8D8B]">
                     <span className="flex items-center gap-1">
                       <Clock className="w-3.5 h-3.5 text-[#8B9D83]" />
                       {service.duration ?? ''}
                     </span>
                     <span className="bg-[#F5F7F4] border border-[#F0EDE8] px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#6B6E6B]">
                       Downtime: {service.downtime ?? ''}
                     </span>
                  </div>

                  {/* Title & Tagline */}
                   <h3 className="text-xl font-serif text-[#1A1C1A] group-hover:text-[#8B9D83] transition-colors">
                     {service.name ?? ''}
                   </h3>

                   <p className="text-xs sm:text-sm text-[#6B6E6B] line-clamp-3 leading-relaxed">
                     {service.tagline ?? ''}
                   </p>

                  {/* Ideal For Tags */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                     {(service.idealFor ?? (service as any).ideal_for ?? []).slice(0, 3).map((item: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5F7F4] text-[#6B6E6B] font-medium border border-[#F0EDE8]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#F0EDE8] flex items-center gap-2">
                  <button
                    id={`book-service-${service.id}`}
                    onClick={() => onSelectServiceForBooking(service.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2D302E] text-white text-xs font-medium hover:bg-black active:scale-98 transition-all shadow-xs"
                  >
                    <span>Book with BookFlow</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#8B9D83]" />
                  </button>

                  <button
                    id={`view-details-${service.id}`}
                    onClick={() => onOpenDetails(service)}
                    aria-label={`View details for ${service.name}`}
                    className="p-2.5 rounded-full border border-[#F0EDE8] text-[#6B6E6B] hover:text-[#2D302E] hover:bg-[#F5F7F4] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Booking Guarantee Banner */}
        <div className="mt-14 p-6 rounded-2xl bg-[#F9F8F6] border border-[#F0EDE8] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-semibold text-[#1A1C1A]">
              Looking for a combined treatment package or bespoke plan?
            </h4>
            <p className="text-xs text-[#6B6E6B]">
              Sarah and Dr. Emma curate personalized multi-modality transformation regimens during your initial consultation.
            </p>
          </div>
          <button
            onClick={() => onSelectServiceForBooking('hydrafacial-platinum')}
            className="shrink-0 px-6 py-2.5 rounded-full bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] shadow-xs transition-all"
          >
            Book Consultation & Skin Analysis
          </button>
        </div>

      </div>
    </section>
  );
};
