import React from 'react';
import { X, Clock, ShieldCheck, Check, Sparkles, Calendar, ArrowRight, Layers, AlertCircle } from 'lucide-react';
import { Service } from '../types';

interface ServiceDetailModalProps {
  service: Service | null;
  onClose: () => void;
  onBookService: (serviceId: string) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#FDFCFB] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#F0EDE8] shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#1A1C1A] hover:bg-[#F5F7F4] flex items-center justify-center border border-[#F0EDE8] shadow-xs transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Banner */}
        <div className="relative aspect-16/9 bg-stone-100 overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] bg-[#8B9D83] text-white px-2.5 py-0.5 rounded-full">
              Medical Aesthetic Protocol
            </span>
            <h2 id="service-modal-title" className="text-2xl sm:text-3xl font-light serif mt-1 text-white">
              {service.name}
            </h2>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key Specs Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F5F7F4] border border-[#F0EDE8] text-center">
            <div>
              <p className="text-[11px] text-[#6B6E6B] uppercase font-semibold">Pricing</p>
              <p className="text-sm sm:text-base font-bold text-[#1A1C1A] mt-0.5">{service.price}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#6B6E6B] uppercase font-semibold">Duration</p>
              <p className="text-sm sm:text-base font-bold text-[#1A1C1A] mt-0.5">{service.duration}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#6B6E6B] uppercase font-semibold">Downtime</p>
              <p className="text-sm sm:text-base font-bold text-[#1A1C1A] mt-0.5">{service.downtime}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83]">
              Treatment Overview
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6E6B] leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Procedure Steps if available */}
          {service.procedureSteps && service.procedureSteps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#8B9D83]" />
                Clinical Step-by-Step Experience
              </h3>
              <div className="space-y-2">
                {service.procedureSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#2D302E] bg-white p-3.5 rounded-xl border border-[#F0EDE8]">
                    <span className="w-5 h-5 rounded-full bg-[#2D302E] text-[#8B9D83] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Benefits */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9D83] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8B9D83]" />
              Expected Clinical Outcomes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#2D302E]">
                  <Check className="w-3.5 h-3.5 text-[#8B9D83] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-[#F0EDE8] flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onBookService(service.id);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#2D302E] text-white text-sm font-medium hover:bg-black shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-[#8B9D83]" />
              <span>Book This Service via BookFlow</span>
              <ArrowRight className="w-4 h-4 text-[#A5A29D]" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
