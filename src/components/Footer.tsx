import React, { useState } from 'react';
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart, ArrowRight, Check } from 'lucide-react';
import { SPA_INFO } from '../data/spaData';

interface FooterProps {
  onOpenBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer id="footer" className="bg-[#1A1C1A] text-[#FDFCFB] pt-16 pb-12 border-t border-[#2D302E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter & Credit Card */}
        <div className="bg-[#232624] rounded-2xl p-8 sm:p-10 border border-[#2D302E] mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B9D83]/15 text-[#8B9D83] text-xs font-semibold uppercase tracking-[0.2em] border border-[#8B9D83]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Lumina Privilege Club
            </div>
            <h3 className="text-2xl sm:text-3xl font-light serif text-white">
              Receive $50 Toward Your First Treatment
            </h3>
            <p className="text-xs sm:text-sm text-[#A5A29D] max-w-lg">
              Join our private guest registry for physician skincare insights, seasonal treatment releases, and VIP appointment access.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="bg-[#8B9D83]/20 border border-[#8B9D83] text-[#8B9D83] p-4 rounded-2xl flex items-center gap-2 text-xs font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you! Your $50 welcome voucher has been dispatched to your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 rounded-full bg-[#1A1C1A] border border-[#3D403D] text-xs sm:text-sm text-white placeholder:text-[#6B6E6B] focus:outline-hidden focus:border-[#8B9D83] flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-all whitespace-nowrap active:scale-98"
                >
                  Claim $50 Credit
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links & Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#2D302E]">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#232624] text-[#8B9D83] flex items-center justify-center border border-[#8B9D83]/30 font-serif text-xl">
                L
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-semibold tracking-wider uppercase text-white">
                  Lumina
                </span>
                <span className="text-[10px] tracking-[0.2em] text-[#8B9D83] uppercase font-medium">
                  Med Spa & Wellness
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A5A29D] leading-relaxed max-w-sm">
              Clinical dermatology and restorative aesthetics curated by Dr. Emma Harrison, MD and Sarah Jenkins, LE. Delivering natural, luminous outcomes in a serene Beverly Hills setting.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#8B8D8B]">
              <span className="inline-block px-2.5 py-1 rounded bg-[#232624] border border-[#2D302E] text-[#8B9D83] text-[11px] font-semibold">
                Powered by BookFlow CRM
              </span>
            </div>
          </div>

          {/* Treatments Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8B9D83]">
              Featured Procedures
            </h4>
            <ul className="space-y-2 text-xs text-[#A5A29D]">
              <li><a href="#services" className="hover:text-white transition-colors">Platinum HydraFacial® MD</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Medical Chemical Peels</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Morpheus8 RF Microneedling</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Physician Botox & Dysport</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Clear + Brilliant® Laser</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Cellular NAD+ & Vitamin Infusion</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8B9D83]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#A5A29D]">
              <li><a href="#treatment-matcher" className="hover:text-white transition-colors">Skin Matcher</a></li>
              <li><a href="#why-us" className="hover:text-white transition-colors">Why Lumina</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Medical Team</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Patient Results</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Location & Valet</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQs & Policies</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-[#8B9D83]">
              Concierge & Sanctuary
            </h4>
            <div className="space-y-2.5 text-xs text-[#A5A29D]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#8B9D83] shrink-0 mt-0.5" />
                <span>{SPA_INFO.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8B9D83] shrink-0" />
                <a href={`tel:${SPA_INFO.formattedPhone}`} className="hover:text-white">{SPA_INFO.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8B9D83] shrink-0" />
                <a href={`mailto:${SPA_INFO.email}`} className="hover:text-white">{SPA_INFO.email}</a>
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenBooking}
                  className="w-full px-4 py-2.5 rounded-full bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-all text-center"
                >
                  Book Instant Appointment
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal, Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#8B8D8B] text-center md:text-left">
          <p>
            © {new Date().getFullYear()} Lumina Med Spa Inc. All rights reserved. Powered by BookFlow CRM.
          </p>
          <div className="flex items-center gap-4">
            <span>Physician Supervised Clinic</span>
            <span>•</span>
            <span>HIPAA Compliant</span>
            <span>•</span>
            <span>FDA-Cleared Devices</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
