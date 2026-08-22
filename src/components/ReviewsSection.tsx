import React from 'react';
import { Star, CheckCircle, Sparkles, MessageCircleHeart, ShieldCheck } from 'lucide-react';
import { REVIEWS } from '../data/spaData';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-[#F9F8F6] border-t border-[#F0EDE8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
            <Star className="w-3.5 h-3.5 fill-[#8B9D83] text-[#8B9D83]" />
            Verified Patient Outcomes
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light serif text-[#1A1C1A]">
            Loved by Over 12,000+ Clients
          </h2>
          <p className="text-base text-[#6B6E6B] leading-relaxed">
            Real experiences from patients who trust Dr. Emma, Sarah, and our team with their skin journey.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F0EDE8] shadow-sm hover:border-[#8B9D83] transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#8B9D83]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#8B9D83]" />
                    ))}
                  </div>

                  {rev.verifiedBookFlow && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B9D83] bg-[#F5F7F4] border border-[#F0EDE8] px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-[#8B9D83]" />
                      Verified BookFlow Visit
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-sm sm:text-base text-[#2D302E] leading-relaxed italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-6 mt-6 border-t border-[#F0EDE8] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <h4 className="font-semibold text-[#1A1C1A] text-sm">{rev.author}</h4>
                  <p className="text-[#6B6E6B]">{rev.location}</p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-[#8B9D83] block">{rev.treatment}</span>
                  <span className="text-[#8B8D8B]">Provider: {rev.specialist}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Social Proof Trust Bar */}
        <div className="mt-12 text-center text-xs text-[#6B6E6B] flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8B9D83]" /> 100% Real Patient Testimonials
          </span>
          <span className="hidden sm:inline text-[#D8D5D0]">•</span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#8B9D83] fill-[#8B9D83]" /> 4.98 Google & Yelp Average
          </span>
          <span className="hidden sm:inline text-[#D8D5D0]">•</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8B9D83]" /> HIPAA Compliant Records via BookFlow
          </span>
        </div>

      </div>
    </section>
  );
};
