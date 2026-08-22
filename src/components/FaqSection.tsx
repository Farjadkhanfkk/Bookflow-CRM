import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, Phone } from 'lucide-react';
import { FAQS, SPA_INFO } from '../data/spaData';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQS[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-20 bg-[#FDFCFB] border-t border-[#F0EDE8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#F0EDE8]">
            <HelpCircle className="w-3.5 h-3.5" />
            Patient Guidance & Policies
          </div>
          <h2 className="text-3xl sm:text-4xl font-light serif text-[#1A1C1A]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#6B6E6B]">
            Clear, transparent answers about our clinical protocols, downtime, and BookFlow appointment experience.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className="bg-white rounded-2xl border border-[#F0EDE8] overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-[#F9F8F6]/60 transition-colors"
                >
                  <span className="font-serif text-base sm:text-lg font-normal text-[#1A1C1A]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F5F7F4] border border-[#F0EDE8] flex items-center justify-center shrink-0 text-[#8B9D83] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#E5E2DD]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-[#6B6E6B] leading-relaxed border-t border-[#F0EDE8]">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Have more questions footer */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white border border-[#F0EDE8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <h4 className="text-sm font-semibold text-[#1A1C1A]">
              Have a specific medical skin question?
            </h4>
            <p className="text-xs text-[#6B6E6B]">
              Our clinical care coordinators are on standby to guide you.
            </p>
          </div>
          <a
            href={`tel:${SPA_INFO.formattedPhone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5F7F4] border border-[#F0EDE8] text-xs font-medium text-[#2D302E] hover:bg-[#E5E2DD] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#8B9D83]" />
            <span>Call {SPA_INFO.phone}</span>
          </a>
        </div>

      </div>
    </section>
  );
};
