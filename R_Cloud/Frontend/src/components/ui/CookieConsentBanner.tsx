import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cookie, X } from 'lucide-react';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('rcloud_cookie_consent');
    if (!consent) {
      // Small delay for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('rcloud_cookie_consent', 'accepted_all');
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('rcloud_cookie_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
      role="dialog"
      aria-live="polite"
    >
      <div className="relative p-5 rounded-2xl bg-[#071F14]/95 backdrop-blur-xl border border-[#92FF5F]/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] text-[#F7F9F7]">
        {/* Close icon button */}
        <button
          onClick={handleEssentialOnly}
          aria-label="Dismiss cookie notice"
          className="absolute top-3 right-3 p-1 rounded-lg text-[#CFF1D2]/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-xl bg-[#92FF5F]/20 border border-[#92FF5F]/40 flex items-center justify-center shrink-0 text-[#92FF5F]">
            <Cookie className="w-5 h-5 text-[#92FF5F]" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-sm text-[#F7F9F7] flex items-center gap-1.5">
              <span>Cookie &amp; Security Preferences</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#92FF5F]" />
            </h3>
            <p className="font-inter text-xs text-[#CFF1D2]/80 mt-1 leading-relaxed">
              We use essential cookies to orchestrate your microVM sessions and analytics cookies to optimize agent runtime latency.{' '}
              <Link to="/privacy" className="text-[#92FF5F] underline hover:text-white transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-[#CFF1D2]/15">
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3.5 rounded-xl bg-[#92FF5F] text-[#0F3B27] font-manrope font-bold text-xs shadow-[0_2px_12px_rgba(146,255,95,0.35)] hover:bg-[#92FF5F]/90 transition-all cursor-pointer"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="py-2 px-3.5 rounded-xl bg-[#0F3B27] border border-[#CFF1D2]/25 text-[#F7F9F7] font-manrope font-semibold text-xs hover:border-[#92FF5F]/50 transition-all cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
