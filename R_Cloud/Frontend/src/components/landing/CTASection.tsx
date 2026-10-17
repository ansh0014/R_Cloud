import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="relative w-full py-20 px-6 bg-[#05180F] border-t border-[#0F3B27]">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#0F3B27] via-[#0D3322] to-[#0A2619] border border-[#92FF5F]/30 p-10 sm:p-16 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#92FF5F]/15 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Small Signal Lime box with mono bold text */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#92FF5F] text-[#0F3B27] text-xs font-mono font-bold uppercase mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            START IN 2 MINUTES
          </div>

          <h2 className="text-4xl sm:text-5xl font-instrument text-[#F7F9F7] leading-tight mb-4">
            Try R_Cloud Now.
          </h2>

          <p className="font-inter text-[#CFF1D2]/80 text-base sm:text-lg mb-8">
            Deploy your first autonomous agent runtime with full semantic graph integration in under 120 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#92FF5F] text-[#0F3B27] font-manrope font-bold text-sm hover:bg-[#92FF5F]/90 transition-all shadow-[0_4px_20px_rgba(146,255,95,0.35)] group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 text-[#0F3B27] group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0F3B27]/70 border border-[#CFF1D2]/25 text-[#F7F9F7] font-manrope font-semibold text-sm hover:bg-[#0F3B27] transition-colors"
            >
              Live Demo Sandbox
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
